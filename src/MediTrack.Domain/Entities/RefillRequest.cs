using MediTrack.Domain.Common;
using MediTrack.Domain.Enums;

namespace MediTrack.Domain.Entities;

public class RefillRequest : AuditableEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = default!;

    public Guid PrescriptionId { get; set; }
    public Prescription Prescription { get; set; } = default!;

    public RefillStatus Status { get; set; } = RefillStatus.Requested;
    public string? PatientNote { get; set; }
    public string? ResponseNote { get; set; }
    public Guid? ResolvedByUserId { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
