using MediTrack.Application.Abstractions;
using MediTrack.Domain.Enums;

namespace MediTrack.Workers;

/// <summary>No HTTP context in workers; audit actor is unknown for worker-originated writes.</summary>
public class NullCurrentUser : ICurrentUser
{
    public Guid? UserId => null;
    public UserRole? Role => null;
    public bool IsAuthenticated => false;
}
