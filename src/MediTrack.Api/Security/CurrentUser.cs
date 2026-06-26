using System.Security.Claims;
using IdentityModel = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;
using MediTrack.Application.Abstractions;
using MediTrack.Domain.Enums;

namespace MediTrack.Api.Security;

/// <summary>Resolves the authenticated caller from the JWT claims on the current request.</summary>
public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUser(IHttpContextAccessor accessor) => _accessor = accessor;

    private ClaimsPrincipal? Principal => _accessor.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            var sub = Principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? Principal?.FindFirstValue(IdentityModel.Sub);
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }

    public UserRole? Role =>
        Enum.TryParse<UserRole>(Principal?.FindFirstValue(ClaimTypes.Role), out var r) ? r : null;

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated ?? false;
}
