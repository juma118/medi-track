using MediTrack.Domain.Common;

namespace MediTrack.Domain.Entities;

public class Prescription : AuditableEntity
{
    public Guid AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = default!;

    public string Medication { get; set; } = default!;
    public string Dosage { get; set; } = default!;
    public string Frequency { get; set; } = default!;
    public DateOnly? ExpiryDate { get; set; }
}
