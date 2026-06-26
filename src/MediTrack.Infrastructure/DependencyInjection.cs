using MediTrack.Application.AI;
using MediTrack.Application.Abstractions;
using MediTrack.Application.Auth;
using MediTrack.Infrastructure.AI;
using MediTrack.Infrastructure.Auth;
using MediTrack.Infrastructure.Messaging;
using MediTrack.Infrastructure.Persistence;
using MediTrack.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MediTrack.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        // Options
        services.Configure<JwtOptions>(config.GetSection("Jwt"));
        services.Configure<AiOptions>(config.GetSection("Ai"));
        services.Configure<FileStorageOptions>(config.GetSection("FileStorage"));
        services.Configure<KafkaOptions>(config.GetSection("Kafka"));

        // Database
        services.AddDbContext<ApplicationDbContext>(o =>
            o.UseNpgsql(config.GetConnectionString("Postgres")));
        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        // Redis distributed cache
        services.AddStackExchangeRedisCache(o =>
            o.Configuration = config.GetConnectionString("Redis"));

        // Auth
        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<ITokenService, JwtTokenService>();
        services.AddScoped<IRefreshTokenStore, RedisRefreshTokenStore>();

        // Cross-cutting adapters
        services.AddScoped<ICacheService, RedisCacheService>();
        services.AddSingleton<IFileStorage, LocalFileStorage>();
        services.AddScoped<IAuditLogger, EventAuditLogger>();
        services.AddSingleton<IDocumentTextExtractor, PdfTextExtractor>();

        // Kafka (single producer instance)
        services.AddSingleton<IEventPublisher, KafkaEventPublisher>();

        // AI provider selection
        var provider = config.GetSection("Ai")["Provider"]?.ToLowerInvariant();
        if (provider == "openai")
            // Standard resilience: retries, circuit breaker, timeout (Polly via Http.Resilience).
            services.AddHttpClient<IAIService, OpenAIService>().AddStandardResilienceHandler();
        else
            services.AddSingleton<IAIService, StubAIService>();

        return services;
    }
}
