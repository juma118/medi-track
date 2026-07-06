using MediTrack.Domain.Enums;

namespace MediTrack.Application.Abstractions;

public interface ICurrentUser
{
    Guid? UserId { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
}

public interface IEventPublisher
{
    Task PublishAsync<T>(string topic, string key, T payload, CancellationToken ct = default);
}

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default);
    Task SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken ct = default);
    Task RemoveAsync(string key, CancellationToken ct = default);
}

public interface IFileStorage
{
    Task<string> SaveAsync(string fileName, Stream content, CancellationToken ct = default);
    Task<Stream> OpenReadAsync(string blobKey, CancellationToken ct = default);
}

public interface IAuditLogger
{
    Task LogAsync(string action, string entityType, string? entityId = null, string? details = null, CancellationToken ct = default);
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public interface IDocumentTextExtractor
{
    Task<string> ExtractTextAsync(Stream content, string fileName, CancellationToken ct = default);
}
