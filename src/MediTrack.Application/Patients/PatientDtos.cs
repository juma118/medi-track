namespace MediTrack.Application.Patients;

public record PatientDto(
    Guid Id,
    string FullName,
    DateOnly DateOfBirth,
    string? BloodType,
    string? Phone,
    string? Email,
    string? MedicalHistory,
    DateTime CreatedAt);

public record CreatePatientRequest(
    string FullName,
    DateOnly DateOfBirth,
    string? BloodType,
    string? Phone,
    string? Email,
    string? MedicalHistory);

public record UpdatePatientRequest(
    string FullName,
    DateOnly DateOfBirth,
    string? BloodType,
    string? Phone,
    string? Email,
    string? MedicalHistory);

public record PatientSearchQuery(string? Search, string? BloodType = null, int Page = 1, int PageSize = 20);
