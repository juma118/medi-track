using MediTrack.Domain.Enums;

namespace MediTrack.Application.Abstractions;

/// <summary>Information about the authenticated caller, resolved from the JWT.</summary>
public interface ICurrentUser
{
    Guid? UserId { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
}

/// <summary>Publishes domain events to the event backbone (Kafka).</summary>
public interface IEventPublisher
{
    Task PublishAsync<T>(string topic, string key, T payload, CancellationToken ct = default);
}

/// <summary>Distributed cache (Redis) for hot reads.</summary>
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default);
    Task SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken ct = default);
    Task RemoveAsync(string key, CancellationToken ct = default);
}

/// <summary>Object storage for uploaded files (local disk in MVP, S3/Blob in prod).</summary>
public interface IFileStorage
{
    Task<string> SaveAsync(string fileName, Stream content, CancellationToken ct = default);
    Task<Stream> OpenReadAsync(string blobKey, CancellationToken ct = default);
}

/// <summary>Writes immutable audit entries (also emitted as Kafka events).</summary>
public interface IAuditLogger
{
    Task LogAsync(string action, string entityType, string? entityId = null, string? details = null, CancellationToken ct = default);
}

/// <summary>Hashes and verifies passwords (BCrypt in Infrastructure).</summary>
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

/// <summary>Extracts plain text from an uploaded document (PDF in MVP).</summary>
public interface IDocumentTextExtractor
{
    Task<string> ExtractTextAsync(Stream content, string fileName, CancellationToken ct = default);
}
