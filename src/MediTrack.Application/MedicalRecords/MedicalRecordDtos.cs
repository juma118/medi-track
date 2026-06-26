using MediTrack.Domain.Enums;

namespace MediTrack.Application.MedicalRecords;

public record MedicalRecordDto(
    Guid Id,
    Guid PatientId,
    string FileName,
    RecordType RecordType,
    string? AISummary,
    SummaryStatus SummaryStatus,
    DateTime CreatedAt);

public record UploadMedicalRecordRequest(
    Guid PatientId,
    RecordType RecordType);
