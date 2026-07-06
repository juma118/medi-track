using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MediTrack.Infrastructure.Persistence;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var conn = Environment.GetEnvironmentVariable("MEDITRACK_PG")
                   ?? "Host=127.0.0.1;Port=5433;Database=meditrack;Username=meditrack;Password=meditrack_dev_pw";

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(conn)
            .Options;

        return new ApplicationDbContext(options);
    }
}
