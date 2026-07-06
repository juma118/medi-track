using MediTrack.Application.Events;
using MediTrack.Infrastructure;
using MediTrack.Infrastructure.Messaging;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;

namespace MediTrack.Api.Realtime;

public class RecordSummarizedConsumer : KafkaConsumerBase<MedicalRecordSummarizedEvent>
{
    protected override string Topic => Topics.MedicalRecordSummarized;
    protected override string GroupId => "meditrack-api-realtime";

    private readonly IHubContext<NotificationsHub> _hub;

    public RecordSummarizedConsumer(
        IOptions<KafkaOptions> kafka,
        IServiceProvider services,
        ILogger<RecordSummarizedConsumer> logger,
        IHubContext<NotificationsHub> hub)
        : base(kafka, services, logger) => _hub = hub;

    protected override Task HandleAsync(MedicalRecordSummarizedEvent msg, IServiceProvider scope, CancellationToken ct) =>
        _hub.Clients.Group(NotificationsHub.PatientGroup(msg.PatientId.ToString()))
            .SendAsync("SummaryReady", new { msg.RecordId, msg.PatientId, msg.FileName, msg.Status }, ct);
}
