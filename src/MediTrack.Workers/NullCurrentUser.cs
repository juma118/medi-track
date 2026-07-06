using MediTrack.Application.Abstractions;
using MediTrack.Domain.Enums;

namespace MediTrack.Workers;

public class NullCurrentUser : ICurrentUser
{
    public Guid? UserId => null;
    public UserRole? Role => null;
    public bool IsAuthenticated => false;
}
