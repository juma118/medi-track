using MediTrack.Application.Abstractions;
using MediTrack.Application.Common;
using MediTrack.Application.Events;
using MediTrack.Domain.Entities;
using MediTrack.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Application.MedicalRecords;

public class MedicalRecordService : IMedicalRecordService
{
    private readonly IApplicationDbContext _db;
    private readonly IFileStorage _storage;
    private readonly IEventPublisher _events;
    private readonly IAuditLogger _audit;

    public MedicalRecordService(IApplicationDbContext db, IFileStorage storage, IEventPublisher events, IAuditLogger audit)
    {
        _db = db;
        _storage = storage;
        _events = events;
        _audit = audit;
    }

    public async Task<MedicalRecordDto> UploadAsync(UploadMedicalRecordRequest request, string fileName, Stream content, CancellationToken ct = default)
    {
        if (!await _db.Patients.AnyAsync(p => p.Id == request.PatientId, ct))
            throw AppException.NotFound("Patient");

        var blobKey = await _storage.SaveAsync(fileName, content, ct);

        var record = new MedicalRecord
        {
            PatientId = request.PatientId,
            FileName = fileName,
            BlobKey = blobKey,
            RecordType = request.RecordType,
            SummaryStatus = SummaryStatus.Pending
        };
        _db.MedicalRecords.Add(record);
        await _db.SaveChangesAsync(ct);

        await _events.PublishAsync(Topics.MedicalRecordUploaded, record.Id.ToString(),
            new MedicalRecordUploadedEvent(record.Id, record.PatientId, blobKey, fileName), ct);
        await _audit.LogAsync("MedicalRecordUploaded", "MedicalRecord", record.Id.ToString(), ct: ct);

        return Map(record);
    }

    public async Task<IReadOnlyList<MedicalRecordDto>> GetForPatientAsync(Guid patientId, CancellationToken ct = default) =>
        await _db.MedicalRecords.AsNoTracking()
            .Where(r => r.PatientId == patientId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new MedicalRecordDto(r.Id, r.PatientId, r.FileName, r.RecordType, r.AISummary, r.SummaryStatus, r.CreatedAt))
            .ToListAsync(ct);

    public async Task<MedicalRecordDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var r = await _db.MedicalRecords.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw AppException.NotFound("Medical record");
        return Map(r);
    }

    public async Task<MedicalRecordFile> GetFileAsync(Guid id, CancellationToken ct = default)
    {
        var r = await _db.MedicalRecords.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw AppException.NotFound("Medical record");

        await _audit.LogAsync("MedicalRecordViewed", "MedicalRecord", id.ToString(), ct: ct);
        var stream = await _storage.OpenReadAsync(r.BlobKey, ct);
        return new MedicalRecordFile(stream, r.FileName, ContentTypeFor(r.FileName));
    }

    private static string ContentTypeFor(string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext switch
        {
            ".pdf" => "application/pdf",
            ".txt" => "text/plain",
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            _ => "application/octet-stream",
        };
    }

    private static MedicalRecordDto Map(MedicalRecord r) =>
        new(r.Id, r.PatientId, r.FileName, r.RecordType, r.AISummary, r.SummaryStatus, r.CreatedAt);
}
