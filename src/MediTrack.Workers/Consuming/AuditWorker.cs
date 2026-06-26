using MediTrack.Application.Abstractions;
using MediTrack.Application.Events;
using MediTrack.Domain.Entities;
using MediTrack.Infrastructure;
using MediTrack.Infrastructure.Messaging;
using Microsoft.Extensions.Options;

namespace MediTrack.Workers.Consuming;

/// <summary>Consumes audit events and persists them immutably to the audit_logs table.</summary>
public class AuditWorker : KafkaConsumerBase<AuditEventMessage>
{
    protected override string Topic => Topics.AuditEvent;
    protected override string GroupId => "meditrack-audit";

    public AuditWorker(IOptions<KafkaOptions> kafka, IServiceProvider services, ILogger<AuditWorker> logger)
        : base(kafka, services, logger) { }

    protected override async Task HandleAsync(AuditEventMessage msg, IServiceProvider scope, CancellationToken ct)
    {
        var db = scope.GetRequiredService<IApplicationDbContext>();
        db.AuditLogs.Add(new AuditLog
        {
            ActorUserId = msg.ActorUserId,
            Action = msg.Action,
            EntityType = msg.EntityType,
            EntityId = msg.EntityId,
            Details = msg.Details,
            Timestamp = msg.Timestamp
        });
        await db.SaveChangesAsync(ct);
    }
}
