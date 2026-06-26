using MediTrack.Domain.Enums;

namespace MediTrack.Application.Appointments;

public record AppointmentDto(
    Guid Id,
    Guid PatientId,
    string PatientName,
    Guid DoctorId,
    string DoctorName,
    DateTime ScheduledAt,
    AppointmentStatus Status,
    string? Reason,
    string? Diagnosis);

public record CreateAppointmentRequest(
    Guid PatientId,
    Guid DoctorId,
    DateTime ScheduledAt,
    string? Reason);

public record UpdateDiagnosisRequest(string Diagnosis);

public record UpdateAppointmentStatusRequest(AppointmentStatus Status);
