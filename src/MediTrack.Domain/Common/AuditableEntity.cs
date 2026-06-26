namespace MediTrack.Domain.Common;

/// <summary>Base type giving every entity an Id and creation/update timestamps.</summary>
public abstract class AuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
