using MediTrack.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Tests;

/// <summary>Builds an isolated in-memory ApplicationDbContext per test.</summary>
public static class TestDbContextFactory
{
    public static ApplicationDbContext Create()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"meditrack-tests-{Guid.NewGuid()}")
            .EnableServiceProviderCaching(false)
            .Options;
        return new ApplicationDbContext(options);
    }
}
