using MediTrack.Application.AI;
using MediTrack.Application.Appointments;
using MediTrack.Application.Auth;
using MediTrack.Application.Common;
using MediTrack.Application.Dashboard;
using MediTrack.Application.Doctors;
using MediTrack.Application.MedicalRecords;
using MediTrack.Application.Patients;
using MediTrack.Application.Portal;
using MediTrack.Application.Prescriptions;

namespace MediTrack.Application.Abstractions;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken ct = default);
}

public interface IPatientService
{
    Task<PagedResult<PatientDto>> SearchAsync(PatientSearchQuery query, CancellationToken ct = default);
    Task<PatientDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PatientDto> CreateAsync(CreatePatientRequest request, CancellationToken ct = default);
    Task<PatientDto> UpdateAsync(Guid id, UpdatePatientRequest request, CancellationToken ct = default);
}

public interface IDoctorService
{
    Task<IReadOnlyList<DoctorDto>> GetAllAsync(CancellationToken ct = default);
}

public interface IAppointmentService
{
    Task<AppointmentDto> CreateAsync(CreateAppointmentRequest request, CancellationToken ct = default);
    Task<AppointmentDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<AppointmentDto>> GetForPatientAsync(Guid patientId, CancellationToken ct = default);
    Task<IReadOnlyList<AppointmentDto>> GetTodayAsync(Guid? doctorId, CancellationToken ct = default);
    Task<AppointmentDto> SetDiagnosisAsync(Guid id, UpdateDiagnosisRequest request, CancellationToken ct = default);
    Task<AppointmentDto> SetStatusAsync(Guid id, UpdateAppointmentStatusRequest request, CancellationToken ct = default);
}

public interface IPrescriptionService
{
    Task<PrescriptionDto> CreateAsync(CreatePrescriptionRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<PrescriptionDto>> GetActiveForPatientAsync(Guid patientId, CancellationToken ct = default);
}

public interface IMedicalRecordService
{
    Task<MedicalRecordDto> UploadAsync(UploadMedicalRecordRequest request, string fileName, Stream content, CancellationToken ct = default);
    Task<IReadOnlyList<MedicalRecordDto>> GetForPatientAsync(Guid patientId, CancellationToken ct = default);
    Task<MedicalRecordDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<MedicalRecordFile> GetFileAsync(Guid id, CancellationToken ct = default);
}

/// <summary>The raw stored file for a medical record, ready to stream to the client.</summary>
public record MedicalRecordFile(Stream Content, string FileName, string ContentType);

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct = default);
}

public interface IAiAssistantService
{
    Task<SymptomAnalysisResult> AnalyzeSymptomsAsync(AnalyzeSymptomsRequest request, CancellationToken ct = default);
    Task<PatientChatResponse> ChatAsync(Guid patientId, PatientChatRequest request, CancellationToken ct = default);
}

/// <summary>Patient-facing self-service. All operations are scoped to the logged-in patient.</summary>
public interface IPatientPortalService
{
    Task<PatientDto> GetMyProfileAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AppointmentDto>> GetMyAppointmentsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<PrescriptionDto>> GetMyPrescriptionsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<MedicalRecordDto>> GetMyRecordsAsync(CancellationToken ct = default);
    Task<MedicalRecordFile> GetMyRecordFileAsync(Guid recordId, CancellationToken ct = default);
    Task<AppointmentDto> BookAsync(SelfBookRequest request, CancellationToken ct = default);
    Task<RefillRequestDto> RequestRefillAsync(CreateRefillRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<RefillRequestDto>> GetMyRefillsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<MessageDto>> GetMyMessagesAsync(CancellationToken ct = default);
    Task<MessageDto> SendMessageAsync(SendMessageRequest request, CancellationToken ct = default);
}

/// <summary>Clinic-side management of portal activity (refills, messaging, account provisioning).</summary>
public interface IClinicPortalService
{
    Task<PatientAccountResult> CreatePatientAccountAsync(Guid patientId, CreatePatientAccountRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<RefillRequestDto>> GetPendingRefillsAsync(CancellationToken ct = default);
    Task<RefillRequestDto> ResolveRefillAsync(Guid refillId, ResolveRefillRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<MessageDto>> GetThreadAsync(Guid patientId, CancellationToken ct = default);
    Task<MessageDto> ReplyAsync(Guid patientId, SendMessageRequest request, CancellationToken ct = default);
}
