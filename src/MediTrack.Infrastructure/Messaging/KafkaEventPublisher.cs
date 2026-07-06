using System.Text.Json;
using Confluent.Kafka;
using MediTrack.Application.Abstractions;
using Microsoft.Extensions.Options;

namespace MediTrack.Infrastructure.Messaging;

public sealed class KafkaEventPublisher : IEventPublisher, IDisposable
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private readonly IProducer<string, string> _producer;

    public KafkaEventPublisher(IOptions<KafkaOptions> opt)
    {
        var config = new ProducerConfig
        {
            BootstrapServers = opt.Value.BootstrapServers,
            Acks = Acks.All,
            EnableIdempotence = true,
            MessageTimeoutMs = 10000
        };
        _producer = new ProducerBuilder<string, string>(config).Build();
    }

    public async Task PublishAsync<T>(string topic, string key, T payload, CancellationToken ct = default)
    {
        var value = JsonSerializer.Serialize(payload, Json);
        await _producer.ProduceAsync(topic, new Message<string, string> { Key = key, Value = value }, ct);
    }

    public void Dispose()
    {
        _producer.Flush(TimeSpan.FromSeconds(5));
        _producer.Dispose();
    }
}
