using MediTrack.Domain.Enums;

namespace MediTrack.Application.Portal;


public record SelfBookRequest(Guid DoctorId, DateTime ScheduledAt, string? Reason);

public record RefillRequestDto(
    Guid Id,
    Guid PrescriptionId,
    string Medication,
    RefillStatus Status,
    string? PatientNote,
    string? ResponseNote,
    DateTime CreatedAt,
    DateTime? ResolvedAt,
    string? PatientName = null);

public record CreateRefillRequest(Guid PrescriptionId, string? Note);

public record ResolveRefillRequest(bool Approve, string? ResponseNote);

public record MessageDto(
    Guid Id,
    bool FromPatient,
    string SenderName,
    string Body,
    DateTime CreatedAt,
    bool Read);

public record SendMessageRequest(string Body);

public record CreatePatientAccountRequest(string Email, string Password);

public record PatientAccountResult(Guid PatientId, string Email);
