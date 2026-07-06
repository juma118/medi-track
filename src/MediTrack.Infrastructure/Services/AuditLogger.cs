using MediTrack.Application.Abstractions;
using MediTrack.Application.Events;

namespace MediTrack.Infrastructure.Services;

public class EventAuditLogger : IAuditLogger
{
    private readonly IEventPublisher _events;
    private readonly ICurrentUser _currentUser;

    public EventAuditLogger(IEventPublisher events, ICurrentUser currentUser)
    {
        _events = events;
        _currentUser = currentUser;
    }

    public Task LogAsync(string action, string entityType, string? entityId = null, string? details = null, CancellationToken ct = default)
    {
        var msg = new AuditEventMessage(_currentUser.UserId, action, entityType, entityId, details, DateTime.UtcNow);
        return _events.PublishAsync(Topics.AuditEvent, entityId ?? entityType, msg, ct);
    }
}
