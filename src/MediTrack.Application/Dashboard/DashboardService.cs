using MediTrack.Application.Abstractions;
using MediTrack.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Application.Dashboard;

public class DashboardService : IDashboardService
{
    private const string CacheKey = "dashboard:stats";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(60);

    private readonly IApplicationDbContext _db;
    private readonly ICacheService _cache;

    public DashboardService(IApplicationDbContext db, ICacheService cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        var cached = await _cache.GetAsync<DashboardStatsDto>(CacheKey, ct);
        if (cached is not null) return cached;

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var weekStart = today.AddDays(-6);

        // KPI scalars come from the meditrack_dashboard_stats() stored procedure.
        var kpis = await _db.Database.QuerySingleAsync(
            "SELECT * FROM meditrack_dashboard_stats()",
            r => new
            {
                TotalPatients = (int)r.GetInt64(0),
                TodaysAppointments = (int)r.GetInt64(1),
                PendingAppointments = (int)r.GetInt64(2),
                ActivePrescriptions = (int)r.GetInt64(3),
                NewPatientsThisMonth = (int)r.GetInt64(4)
            }, ct);

        var raw = await _db.Appointments
            .Where(a => a.ScheduledAt >= weekStart && a.ScheduledAt < tomorrow)
            .GroupBy(a => a.ScheduledAt.Date)
            .Select(g => new { Day = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var byDay = Enumerable.Range(0, 7)
            .Select(i => today.AddDays(-6 + i))
            .Select(d => new AppointmentsByDayDto(
                DateOnly.FromDateTime(d),
                raw.FirstOrDefault(x => x.Day == d)?.Count ?? 0))
            .ToList();

        var stats = new DashboardStatsDto(
            kpis.TotalPatients, kpis.TodaysAppointments, kpis.PendingAppointments,
            kpis.ActivePrescriptions, kpis.NewPatientsThisMonth, byDay);

        await _cache.SetAsync(CacheKey, stats, CacheTtl, ct);
        return stats;
    }
}
