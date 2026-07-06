using MediTrack.Domain.Common;

namespace MediTrack.Domain.Entities;

public class Patient : AuditableEntity
{
    public string FullName { get; set; } = default!;
    public DateOnly DateOfBirth { get; set; }
    public string? BloodType { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? MedicalHistory { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
}
