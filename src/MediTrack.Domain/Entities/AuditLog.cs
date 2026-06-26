namespace MediTrack.Domain.Entities;

/// <summary>Append-only record of every sensitive access/mutation. Never updated or deleted.</summary>
public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? ActorUserId { get; set; }
    public string Action { get; set; } = default!;       // e.g. "PatientRecordAccessed"
    public string EntityType { get; set; } = default!;   // e.g. "Patient"
    public string? EntityId { get; set; }
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; }
}
