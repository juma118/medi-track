using MediTrack.Application.Abstractions;
using MediTrack.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Application.Auth;

public class AuthService : IAuthService
{
    private static readonly TimeSpan RefreshTtl = TimeSpan.FromDays(7);

    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokens;
    private readonly IRefreshTokenStore _refreshStore;

    public AuthService(IApplicationDbContext db, IPasswordHasher hasher, ITokenService tokens, IRefreshTokenStore refreshStore)
    {
        _db = db;
        _hasher = hasher;
        _tokens = tokens;
        _refreshStore = refreshStore;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive, ct);
        if (user is null || !_hasher.Verify(request.Password, user.PasswordHash))
            throw new AppException("Invalid email or password.", 401);

        return await IssueAsync(user.Id, user.FullName, user.Role, user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken ct = default)
    {
        var userId = await _refreshStore.ConsumeAsync(request.RefreshToken, ct)
            ?? throw new AppException("Invalid or expired refresh token.", 401);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive, ct)
            ?? throw new AppException("Invalid or expired refresh token.", 401);

        return await IssueAsync(user.Id, user.FullName, user.Role, user, ct);
    }

    private async Task<AuthResponse> IssueAsync(Guid userId, string fullName, Domain.Enums.UserRole role, Domain.Entities.User user, CancellationToken ct)
    {
        var (token, expiresAt) = _tokens.CreateAccessToken(user);
        var refresh = _tokens.CreateRefreshToken();
        await _refreshStore.SaveAsync(refresh, userId, RefreshTtl, ct);
        return new AuthResponse(token, refresh, fullName, role, expiresAt);
    }
}
