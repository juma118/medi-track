using System.Text;
using MediTrack.Application.Abstractions;
using MediTrack.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Application.AI;

public class AiAssistantService : IAiAssistantService
{
    private readonly IApplicationDbContext _db;
    private readonly IAIService _ai;
    private readonly IAuditLogger _audit;

    public AiAssistantService(IApplicationDbContext db, IAIService ai, IAuditLogger audit)
    {
        _db = db;
        _ai = ai;
        _audit = audit;
    }

    public async Task<SymptomAnalysisResult> AnalyzeSymptomsAsync(AnalyzeSymptomsRequest request, CancellationToken ct = default)
    {
        if (!await _db.Patients.AnyAsync(p => p.Id == request.PatientId, ct))
            throw AppException.NotFound("Patient");

        await _audit.LogAsync("SymptomAnalysisRequested", "Patient", request.PatientId.ToString(), ct: ct);
        return await _ai.AnalyzeSymptomsAsync(request.Symptoms, ct);
    }

    public async Task<PatientChatResponse> ChatAsync(Guid patientId, PatientChatRequest request, CancellationToken ct = default)
    {
        var patient = await _db.Patients.AsNoTracking().FirstOrDefaultAsync(p => p.Id == patientId, ct)
            ?? throw AppException.NotFound("Patient");

        var context = await BuildContextAsync(patientId, patient.FullName, patient.DateOfBirth, patient.BloodType, patient.MedicalHistory, ct);
        await _audit.LogAsync("PatientHistoryChat", "Patient", patientId.ToString(), request.Question, ct);

        var answer = await _ai.ChatWithPatientHistoryAsync(request.Question, context, ct);
        return new PatientChatResponse(answer);
    }

    // Lightweight RAG: assemble grounded context from the patient's real records.
    private async Task<string> BuildContextAsync(Guid patientId, string name, DateOnly dob, string? blood, string? history, CancellationToken ct)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"PATIENT: {name}, DOB {dob:yyyy-MM-dd}, Blood type: {blood ?? "unknown"}");
        if (!string.IsNullOrWhiteSpace(history))
            sb.AppendLine($"MEDICAL HISTORY: {history}");

        var appointments = await _db.Appointments.AsNoTracking()
            .Where(a => a.PatientId == patientId)
            .OrderByDescending(a => a.ScheduledAt).Take(20)
            .Select(a => new { a.ScheduledAt, a.Status, a.Reason, a.Diagnosis, Doctor = a.Doctor.FullName })
            .ToListAsync(ct);

        sb.AppendLine("\nAPPOINTMENTS:");
        foreach (var a in appointments)
            sb.AppendLine($"- {a.ScheduledAt:yyyy-MM-dd} ({a.Status}) with Dr. {a.Doctor}. Reason: {a.Reason ?? "n/a"}. Diagnosis: {a.Diagnosis ?? "n/a"}");

        var prescriptions = await _db.Prescriptions.AsNoTracking()
            .Where(p => p.Appointment.PatientId == patientId)
            .OrderByDescending(p => p.CreatedAt).Take(30)
            .Select(p => new { p.Medication, p.Dosage, p.Frequency, p.ExpiryDate })
            .ToListAsync(ct);

        sb.AppendLine("\nPRESCRIPTIONS:");
        foreach (var p in prescriptions)
            sb.AppendLine($"- {p.Medication} {p.Dosage}, {p.Frequency}. Expires: {(p.ExpiryDate.HasValue ? p.ExpiryDate.Value.ToString("yyyy-MM-dd") : "n/a")}");

        var summaries = await _db.MedicalRecords.AsNoTracking()
            .Where(r => r.PatientId == patientId && r.AISummary != null)
            .OrderByDescending(r => r.CreatedAt).Take(10)
            .Select(r => new { r.FileName, r.AISummary })
            .ToListAsync(ct);

        sb.AppendLine("\nRECORD SUMMARIES:");
        foreach (var r in summaries)
            sb.AppendLine($"- {r.FileName}: {r.AISummary}");

        return sb.ToString();
    }
}
