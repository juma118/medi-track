namespace MediTrack.Application.Events;

/// <summary>Canonical Kafka topic names shared by producers and consumers.</summary>
public static class Topics
{
    public const string MedicalRecordUploaded = "meditrack.medical-record.uploaded";
    public const string MedicalRecordSummarized = "meditrack.medical-record.summarized";
    public const string SymptomAnalysisRequested = "meditrack.symptom-analysis.requested";
    public const string AppointmentBooked = "meditrack.appointment.booked";
    public const string PrescriptionCreated = "meditrack.prescription.created";
    public const string AuditEvent = "meditrack.audit.event";
}

public record MedicalRecordUploadedEvent(Guid RecordId, Guid PatientId, string BlobKey, string FileName);

public record MedicalRecordSummarizedEvent(Guid RecordId, Guid PatientId, string FileName, string Status);

public record SymptomAnalysisRequestedEvent(Guid RequestId, Guid PatientId, Guid RequestedByUserId, string Symptoms);

public record AppointmentBookedEvent(Guid AppointmentId, Guid PatientId, Guid DoctorId, DateTime ScheduledAt);

public record PrescriptionCreatedEvent(Guid PrescriptionId, Guid AppointmentId, Guid PatientId, string Medication);

public record AuditEventMessage(Guid? ActorUserId, string Action, string EntityType, string? EntityId, string? Details, DateTime Timestamp);
