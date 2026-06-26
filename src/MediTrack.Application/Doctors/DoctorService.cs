using MediTrack.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Application.Doctors;

public class DoctorService : IDoctorService
{
    private readonly IApplicationDbContext _db;

    public DoctorService(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<DoctorDto>> GetAllAsync(CancellationToken ct = default) =>
        await _db.Doctors.AsNoTracking()
            .OrderBy(d => d.FullName)
            .Select(d => new DoctorDto(d.Id, d.FullName, d.Specialty))
            .ToListAsync(ct);
}
