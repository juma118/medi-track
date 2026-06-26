using MediTrack.Domain.Common;
using MediTrack.Domain.Enums;

namespace MediTrack.Domain.Entities;

public class Appointment : AuditableEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = default!;

    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; } = default!;

    public DateTime ScheduledAt { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    public string? Reason { get; set; }
    public string? Diagnosis { get; set; }

    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
}
