using MediTrack.Application.Abstractions;
using MediTrack.Application.Appointments;
using MediTrack.Application.Common;
using MediTrack.Application.MedicalRecords;
using MediTrack.Application.Patients;
using MediTrack.Application.Prescriptions;
using MediTrack.Domain.Entities;
using MediTrack.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Application.Portal;

public class PatientPortalService : IPatientPortalService
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IAppointmentService _appointments;
    private readonly IPrescriptionService _prescriptions;
    private readonly IMedicalRecordService _records;

    public PatientPortalService(
        IApplicationDbContext db, ICurrentUser currentUser,
        IAppointmentService appointments, IPrescriptionService prescriptions, IMedicalRecordService records)
    {
        _db = db;
        _currentUser = currentUser;
        _appointments = appointments;
        _prescriptions = prescriptions;
        _records = records;
    }

    private async Task<(Guid Id, string Name)> MeAsync(CancellationToken ct)
    {
        var uid = _currentUser.UserId ?? throw AppException.Forbidden();
        var me = await _db.Patients.AsNoTracking()
            .Where(p => p.UserId == uid)
            .Select(p => new { p.Id, p.FullName })
            .FirstOrDefaultAsync(ct)
            ?? throw AppException.Forbidden("No patient profile is linked to this account.");
        return (me.Id, me.FullName);
    }

    public async Task<PatientDto> GetMyProfileAsync(CancellationToken ct = default)
    {
        var (id, _) = await MeAsync(ct);
        var p = await _db.Patients.AsNoTracking().FirstAsync(p => p.Id == id, ct);
        return new PatientDto(p.Id, p.FullName, p.DateOfBirth, p.BloodType, p.Phone, p.Email, p.MedicalHistory, p.CreatedAt);
    }

    public async Task<IReadOnlyList<AppointmentDto>> GetMyAppointmentsAsync(CancellationToken ct = default)
    {
        var (id, _) = await MeAsync(ct);
        return await _appointments.GetForPatientAsync(id, ct);
    }

    public async Task<IReadOnlyList<PrescriptionDto>> GetMyPrescriptionsAsync(CancellationToken ct = default)
    {
        var (id, _) = await MeAsync(ct);
        return await _prescriptions.GetActiveForPatientAsync(id, ct);
    }

    public async Task<IReadOnlyList<MedicalRecordDto>> GetMyRecordsAsync(CancellationToken ct = default)
    {
        var (id, _) = await MeAsync(ct);
        return await _records.GetForPatientAsync(id, ct);
    }

    public async Task<MedicalRecordFile> GetMyRecordFileAsync(Guid recordId, CancellationToken ct = default)
    {
        var (id, _) = await MeAsync(ct);
        var owns = await _db.MedicalRecords.AsNoTracking().AnyAsync(r => r.Id == recordId && r.PatientId == id, ct);
        if (!owns) throw AppException.Forbidden("This record does not belong to you.");
        return await _records.GetFileAsync(recordId, ct);
    }

    public async Task<AppointmentDto> BookAsync(SelfBookRequest request, CancellationToken ct = default)
    {
        var (id, _) = await MeAsync(ct);
        return await _appointments.CreateAsync(
            new CreateAppointmentRequest(id, request.DoctorId, request.ScheduledAt, request.Reason), ct);
    }

    public async Task<RefillRequestDto> RequestRefillAsync(CreateRefillRequest request, CancellationToken ct = default)
    {
        var (id, _) = await MeAsync(ct);
        var rx = await _db.Prescriptions.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.PrescriptionId && p.Appointment.PatientId == id, ct)
            ?? throw AppException.NotFound("Prescription");

        var refill = new RefillRequest
        {
            PatientId = id,
            PrescriptionId = rx.Id,
            PatientNote = request.Note,
            Status = RefillStatus.Requested
        };
        _db.RefillRequests.Add(refill);
        await _db.SaveChangesAsync(ct);

        return new RefillRequestDto(refill.Id, rx.Id, rx.Medication, refill.Status, refill.PatientNote, null, refill.CreatedAt, null);
    }

    public async Task<IReadOnlyList<RefillRequestDto>> GetMyRefillsAsync(CancellationToken ct = default)
    {
        var (id, _) = await MeAsync(ct);
        return await _db.RefillRequests.AsNoTracking()
            .Where(r => r.PatientId == id)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new RefillRequestDto(r.Id, r.PrescriptionId, r.Prescription.Medication, r.Status,
                r.PatientNote, r.ResponseNote, r.CreatedAt, r.ResolvedAt, null))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<MessageDto>> GetMyMessagesAsync(CancellationToken ct = default)
    {
        var (id, _) = await MeAsync(ct);
        return await _db.Messages.AsNoTracking()
            .Where(m => m.PatientId == id)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new MessageDto(m.Id, m.FromPatient, m.SenderName, m.Body, m.CreatedAt, m.ReadAt != null))
            .ToListAsync(ct);
    }

    public async Task<MessageDto> SendMessageAsync(SendMessageRequest request, CancellationToken ct = default)
    {
        var (id, name) = await MeAsync(ct);
        var msg = new Message
        {
            PatientId = id,
            SenderUserId = _currentUser.UserId!.Value,
            SenderName = name,
            FromPatient = true,
            Body = request.Body,
            CreatedAt = DateTime.UtcNow
        };
        _db.Messages.Add(msg);
        await _db.SaveChangesAsync(ct);
        return new MessageDto(msg.Id, true, msg.SenderName, msg.Body, msg.CreatedAt, false);
    }
}
