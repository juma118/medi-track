using MediTrack.Application.Abstractions;
using MediTrack.Application.Common;
using MediTrack.Domain.Entities;
using MediTrack.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Application.Portal;

public class ClinicPortalService : IClinicPortalService
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IPasswordHasher _hasher;
    private readonly IAuditLogger _audit;

    public ClinicPortalService(IApplicationDbContext db, ICurrentUser currentUser, IPasswordHasher hasher, IAuditLogger audit)
    {
        _db = db;
        _currentUser = currentUser;
        _hasher = hasher;
        _audit = audit;
    }

    public async Task<PatientAccountResult> CreatePatientAccountAsync(Guid patientId, CreatePatientAccountRequest request, CancellationToken ct = default)
    {
        var patient = await _db.Patients.FirstOrDefaultAsync(p => p.Id == patientId, ct)
            ?? throw AppException.NotFound("Patient");
        if (patient.UserId is not null)
            throw AppException.Conflict("This patient already has a portal account.");
        if (await _db.Users.AnyAsync(u => u.Email == request.Email, ct))
            throw AppException.Conflict("That email is already in use.");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = _hasher.Hash(request.Password),
            FullName = patient.FullName,
            Role = UserRole.Patient
        };
        _db.Users.Add(user);
        patient.UserId = user.Id;
        await _db.SaveChangesAsync(ct);
        await _audit.LogAsync("PatientAccountCreated", "Patient", patientId.ToString(), ct: ct);

        return new PatientAccountResult(patientId, request.Email);
    }

    public async Task<IReadOnlyList<RefillRequestDto>> GetPendingRefillsAsync(CancellationToken ct = default) =>
        await _db.RefillRequests.AsNoTracking()
            .Where(r => r.Status == RefillStatus.Requested)
            .OrderBy(r => r.CreatedAt)
            .Select(r => new RefillRequestDto(r.Id, r.PrescriptionId, r.Prescription.Medication, r.Status,
                r.PatientNote, r.ResponseNote, r.CreatedAt, r.ResolvedAt, r.Patient.FullName))
            .ToListAsync(ct);

    public async Task<RefillRequestDto> ResolveRefillAsync(Guid refillId, ResolveRefillRequest request, CancellationToken ct = default)
    {
        var refill = await _db.RefillRequests.Include(r => r.Prescription)
            .FirstOrDefaultAsync(r => r.Id == refillId, ct)
            ?? throw AppException.NotFound("Refill request");

        refill.Status = request.Approve ? RefillStatus.Approved : RefillStatus.Denied;
        refill.ResponseNote = request.ResponseNote;
        refill.ResolvedByUserId = _currentUser.UserId;
        refill.ResolvedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        await _audit.LogAsync("RefillResolved", "RefillRequest", refillId.ToString(), refill.Status.ToString(), ct);

        return new RefillRequestDto(refill.Id, refill.PrescriptionId, refill.Prescription.Medication, refill.Status,
            refill.PatientNote, refill.ResponseNote, refill.CreatedAt, refill.ResolvedAt);
    }

    public async Task<IReadOnlyList<MessageDto>> GetThreadAsync(Guid patientId, CancellationToken ct = default) =>
        await _db.Messages.AsNoTracking()
            .Where(m => m.PatientId == patientId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new MessageDto(m.Id, m.FromPatient, m.SenderName, m.Body, m.CreatedAt, m.ReadAt != null))
            .ToListAsync(ct);

    public async Task<MessageDto> ReplyAsync(Guid patientId, SendMessageRequest request, CancellationToken ct = default)
    {
        if (!await _db.Patients.AnyAsync(p => p.Id == patientId, ct))
            throw AppException.NotFound("Patient");

        var uid = _currentUser.UserId ?? throw AppException.Forbidden();
        var senderName = await _db.Users.Where(u => u.Id == uid).Select(u => u.FullName).FirstOrDefaultAsync(ct) ?? "Clinic";

        var msg = new Message
        {
            PatientId = patientId,
            SenderUserId = uid,
            SenderName = senderName,
            FromPatient = false,
            Body = request.Body,
            CreatedAt = DateTime.UtcNow
        };
        _db.Messages.Add(msg);
        await _db.SaveChangesAsync(ct);
        return new MessageDto(msg.Id, false, msg.SenderName, msg.Body, msg.CreatedAt, false);
    }
}
