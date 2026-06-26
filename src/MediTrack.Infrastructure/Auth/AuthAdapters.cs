using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using MediTrack.Application.Abstractions;
using MediTrack.Application.Auth;
using MediTrack.Domain.Entities;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace MediTrack.Infrastructure.Auth;

public class BCryptPasswordHasher : IPasswordHasher
{
    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);
    public bool Verify(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
}

public class JwtTokenService : ITokenService
{
    private readonly JwtOptions _opt;

    public JwtTokenService(IOptions<JwtOptions> opt) => _opt = opt.Value;

    public (string token, DateTime expiresAt) CreateAccessToken(User user)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_opt.AccessTokenMinutes);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _opt.Issuer, audience: _opt.Audience,
            claims: claims, expires: expiresAt, signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public string CreateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes);
    }
}

/// <summary>Refresh tokens stored in Redis (single-use; consumed on refresh).</summary>
public class RedisRefreshTokenStore : IRefreshTokenStore
{
    private readonly IDistributedCache _cache;

    public RedisRefreshTokenStore(IDistributedCache cache) => _cache = cache;

    private static string Key(string token) => $"refresh:{token}";

    public Task SaveAsync(string refreshToken, Guid userId, TimeSpan ttl, CancellationToken ct = default) =>
        _cache.SetStringAsync(Key(refreshToken), userId.ToString(),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl }, ct);

    public async Task<Guid?> ConsumeAsync(string refreshToken, CancellationToken ct = default)
    {
        var key = Key(refreshToken);
        var value = await _cache.GetStringAsync(key, ct);
        if (value is null) return null;
        await _cache.RemoveAsync(key, ct);     // single-use rotation
        return Guid.TryParse(value, out var id) ? id : null;
    }
}
