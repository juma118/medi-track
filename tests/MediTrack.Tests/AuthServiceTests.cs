using MediTrack.Application.Abstractions;
using MediTrack.Application.Auth;
using MediTrack.Application.Common;
using MediTrack.Domain.Entities;
using MediTrack.Domain.Enums;
using NSubstitute;

namespace MediTrack.Tests;

public class AuthServiceTests
{
    private static (AuthService svc, Infrastructure.Persistence.ApplicationDbContext db) Build(
        IPasswordHasher hasher, ITokenService tokens, IRefreshTokenStore store)
    {
        var db = TestDbContextFactory.Create();
        return (new AuthService(db, hasher, tokens, store), db);
    }

    [Fact]
    public async Task Login_with_valid_credentials_returns_tokens()
    {
        var hasher = Substitute.For<IPasswordHasher>();
        hasher.Verify("pw", "hash").Returns(true);
        var tokens = Substitute.For<ITokenService>();
        tokens.CreateAccessToken(Arg.Any<User>()).Returns(("access-token", DateTime.UtcNow.AddHours(1)));
        tokens.CreateRefreshToken().Returns("refresh-token");
        var store = Substitute.For<IRefreshTokenStore>();

        var (svc, db) = Build(hasher, tokens, store);
        using (db)
        {
            db.Users.Add(new User { Email = "doc@x.com", PasswordHash = "hash", FullName = "Doc", Role = UserRole.Doctor });
            await db.SaveChangesAsync();

            var result = await svc.LoginAsync(new LoginRequest("doc@x.com", "pw"));

            Assert.Equal("access-token", result.AccessToken);
            Assert.Equal("refresh-token", result.RefreshToken);
            Assert.Equal(UserRole.Doctor, result.Role);
            await store.Received().SaveAsync("refresh-token", Arg.Any<Guid>(), Arg.Any<TimeSpan>(), Arg.Any<CancellationToken>());
        }
    }

    [Fact]
    public async Task Login_with_wrong_password_throws_401()
    {
        var hasher = Substitute.For<IPasswordHasher>();
        hasher.Verify(Arg.Any<string>(), Arg.Any<string>()).Returns(false);
        var (svc, db) = Build(hasher, Substitute.For<ITokenService>(), Substitute.For<IRefreshTokenStore>());
        using (db)
        {
            db.Users.Add(new User { Email = "doc@x.com", PasswordHash = "hash", FullName = "Doc", Role = UserRole.Doctor });
            await db.SaveChangesAsync();

            var ex = await Assert.ThrowsAsync<AppException>(() => svc.LoginAsync(new LoginRequest("doc@x.com", "wrong")));
            Assert.Equal(401, ex.StatusCode);
        }
    }
}
