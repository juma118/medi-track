using MediTrack.Domain.Entities;
using MediTrack.Domain.Enums;

namespace MediTrack.Application.Auth;

public record LoginRequest(string Email, string Password);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    string FullName,
    UserRole Role,
    DateTime ExpiresAt);

public record RefreshRequest(string RefreshToken);

/// <summary>Issues JWT access tokens and opaque refresh tokens.</summary>
public interface ITokenService
{
    (string token, DateTime expiresAt) CreateAccessToken(User user);
    string CreateRefreshToken();
}

/// <summary>Stores/validates refresh tokens in Redis with a TTL.</summary>
public interface IRefreshTokenStore
{
    Task SaveAsync(string refreshToken, Guid userId, TimeSpan ttl, CancellationToken ct = default);
    Task<Guid?> ConsumeAsync(string refreshToken, CancellationToken ct = default);
}
