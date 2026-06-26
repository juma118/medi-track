using System.Text.Json;
using Confluent.Kafka;
using MediTrack.Application.Abstractions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MediTrack.Infrastructure.Messaging;

/// <summary>
/// Base background consumer: subscribes to one topic under a consumer group, deserializes JSON,
/// and dispatches each message to HandleAsync inside a fresh DI scope. Commits after success.
/// On repeated failure the raw message is routed to a dead-letter topic ("&lt;topic&gt;.dlq").
/// </summary>
public abstract class KafkaConsumerBase<TMessage> : BackgroundService
{
    private const int MaxRetries = 3;
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private readonly KafkaOptions _kafka;
    private readonly IServiceProvider _services;
    private readonly ILogger _logger;

    protected abstract string Topic { get; }
    protected abstract string GroupId { get; }

    protected KafkaConsumerBase(IOptions<KafkaOptions> kafka, IServiceProvider services, ILogger logger)
    {
        _kafka = kafka.Value;
        _services = services;
        _logger = logger;
    }

    protected abstract Task HandleAsync(TMessage message, IServiceProvider scope, CancellationToken ct);

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
        => Task.Run(() => ConsumeLoop(stoppingToken), stoppingToken);

    private async Task ConsumeLoop(CancellationToken ct)
    {
        var config = new ConsumerConfig
        {
            BootstrapServers = _kafka.BootstrapServers,
            GroupId = GroupId,
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false
        };

        using var consumer = new ConsumerBuilder<string, string>(config).Build();
        consumer.Subscribe(Topic);
        _logger.LogInformation("Consumer {Group} subscribed to {Topic}", GroupId, Topic);

        while (!ct.IsCancellationRequested)
        {
            ConsumeResult<string, string>? result = null;
            try
            {
                result = consumer.Consume(TimeSpan.FromSeconds(1));
                if (result is null) continue;

                var message = JsonSerializer.Deserialize<TMessage>(result.Message.Value, Json);
                if (message is not null)
                    await ProcessWithRetryAsync(message, result, ct);

                consumer.Commit(result);
            }
            catch (OperationCanceledException) { break; }
            catch (ConsumeException ex)
            {
                // Topic not yet created etc. — transient; back off briefly.
                _logger.LogDebug(ex, "Consume issue on {Topic}", Topic);
                await Task.Delay(1000, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error on {Topic}", Topic);
                if (result is not null) consumer.Commit(result);
                await Task.Delay(1000, ct);
            }
        }

        consumer.Close();
    }

    private async Task ProcessWithRetryAsync(TMessage message, ConsumeResult<string, string> result, CancellationToken ct)
    {
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                using var scope = _services.CreateScope();
                await HandleAsync(message, scope.ServiceProvider, ct);
                return;
            }
            catch (Exception ex) when (attempt < MaxRetries)
            {
                _logger.LogWarning(ex, "Handler failed on {Topic} (attempt {Attempt}/{Max}); retrying", Topic, attempt, MaxRetries);
                await Task.Delay(500 * attempt, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Handler failed on {Topic} after {Max} attempts; routing to dead-letter", Topic, MaxRetries);
                await DeadLetterAsync(result, ex, ct);
                return;
            }
        }
    }

    private async Task DeadLetterAsync(ConsumeResult<string, string> result, Exception ex, CancellationToken ct)
    {
        try
        {
            using var scope = _services.CreateScope();
            var publisher = scope.ServiceProvider.GetRequiredService<IEventPublisher>();
            var dlqPayload = new { original = result.Message.Value, error = ex.Message, topic = Topic };
            await publisher.PublishAsync($"{Topic}.dlq", result.Message.Key ?? "dlq", dlqPayload, ct);
        }
        catch (Exception dlqEx)
        {
            _logger.LogError(dlqEx, "Failed to write to dead-letter for {Topic}", Topic);
        }
    }
}
