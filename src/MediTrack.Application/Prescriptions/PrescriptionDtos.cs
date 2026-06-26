namespace MediTrack.Application.Prescriptions;

public record PrescriptionDto(
    Guid Id,
    Guid AppointmentId,
    string Medication,
    string Dosage,
    string Frequency,
    DateOnly? ExpiryDate);

public record CreatePrescriptionRequest(
    Guid AppointmentId,
    string Medication,
    string Dosage,
    string Frequency,
    DateOnly? ExpiryDate);
