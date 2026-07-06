using MediTrack.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Tests;

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
