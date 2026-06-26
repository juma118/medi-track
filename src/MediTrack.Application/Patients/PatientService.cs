using MediTrack.Application.Abstractions;
using MediTrack.Application.Common;
using MediTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Application.Patients;

public class PatientService : IPatientService
{
    private readonly IApplicationDbContext _db;
    private readonly IAuditLogger _audit;

    public PatientService(IApplicationDbContext db, IAuditLogger audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<PagedResult<PatientDto>> SearchAsync(PatientSearchQuery query, CancellationToken ct = default)
    {
        var page = Math.Max(1, query.Page);
        var size = Math.Clamp(query.PageSize, 1, 100);
        var term = string.IsNullOrWhiteSpace(query.Search) ? null : query.Search.Trim();
        var blood = string.IsNullOrWhiteSpace(query.BloodType) ? null : query.BloodType.Trim();

        // Paginated search via the meditrack_search_patients() stored procedure (total via window count).
        long total = 0;
        var rows = await _db.Database.QueryAsync(
            "SELECT * FROM meditrack_search_patients(@term, @blood, @limit, @offset)",
            r =>
            {
                total = r.GetInt64(8);
                return new PatientDto(
                    r.GetGuid(0),
                    r.GetString(1),
                    r.GetFieldValue<DateOnly>(2),
                    r.IsDBNull(3) ? null : r.GetString(3),
                    r.IsDBNull(4) ? null : r.GetString(4),
                    r.IsDBNull(5) ? null : r.GetString(5),
                    r.IsDBNull(6) ? null : r.GetString(6),
                    r.GetDateTime(7));
            }, ct,
            ("term", (object?)term),
            ("blood", (object?)blood),
            ("limit", size),
            ("offset", (page - 1) * size));

        return new PagedResult<PatientDto> { Items = rows, Page = page, PageSize = size, TotalCount = (int)total };
    }

    public async Task<PatientDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var p = await _db.Patients.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw AppException.NotFound("Patient");
        await _audit.LogAsync("PatientRecordAccessed", "Patient", id.ToString(), ct: ct);
        return Map(p);
    }

    public async Task<PatientDto> CreateAsync(CreatePatientRequest request, CancellationToken ct = default)
    {
        var p = new Patient
        {
            FullName = request.FullName,
            DateOfBirth = request.DateOfBirth,
            BloodType = request.BloodType,
            Phone = request.Phone,
            Email = request.Email,
            MedicalHistory = request.MedicalHistory
        };
        _db.Patients.Add(p);
        await _db.SaveChangesAsync(ct);
        await _audit.LogAsync("PatientCreated", "Patient", p.Id.ToString(), ct: ct);
        return Map(p);
    }

    public async Task<PatientDto> UpdateAsync(Guid id, UpdatePatientRequest request, CancellationToken ct = default)
    {
        var p = await _db.Patients.FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw AppException.NotFound("Patient");

        p.FullName = request.FullName;
        p.DateOfBirth = request.DateOfBirth;
        p.BloodType = request.BloodType;
        p.Phone = request.Phone;
        p.Email = request.Email;
        p.MedicalHistory = request.MedicalHistory;

        await _db.SaveChangesAsync(ct);
        await _audit.LogAsync("PatientUpdated", "Patient", p.Id.ToString(), ct: ct);
        return Map(p);
    }

    private static PatientDto Map(Patient p) =>
        new(p.Id, p.FullName, p.DateOfBirth, p.BloodType, p.Phone, p.Email, p.MedicalHistory, p.CreatedAt);
}
