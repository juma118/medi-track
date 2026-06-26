using MediTrack.Domain.Common;
using MediTrack.Domain.Enums;

namespace MediTrack.Domain.Entities;

public class User : AuditableEntity
{
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;

    // Optional 1:1 link to a doctor profile when Role == Doctor
    public Doctor? Doctor { get; set; }
}
