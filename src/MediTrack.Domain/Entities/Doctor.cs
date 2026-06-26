using MediTrack.Domain.Common;

namespace MediTrack.Domain.Entities;

public class Doctor : AuditableEntity
{
    public string FullName { get; set; } = default!;
    public string Specialty { get; set; } = default!;

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
