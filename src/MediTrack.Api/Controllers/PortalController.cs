using MediTrack.Api.Security;
using MediTrack.Application.Abstractions;
using MediTrack.Application.Appointments;
using MediTrack.Application.Doctors;
using MediTrack.Application.MedicalRecords;
using MediTrack.Application.Patients;
using MediTrack.Application.Portal;
using MediTrack.Application.Prescriptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediTrack.Api.Controllers;

[ApiController]
[Authorize(Roles = Roles.Patient)]
[Route("api/portal")]
public class PortalController : ControllerBase
{
    private readonly IPatientPortalService _portal;
    private readonly IDoctorService _doctors;

    public PortalController(IPatientPortalService portal, IDoctorService doctors)
    {
        _portal = portal;
        _doctors = doctors;
    }

    [HttpGet("me")]
    public Task<PatientDto> Me(CancellationToken ct) => _portal.GetMyProfileAsync(ct);

    [HttpGet("doctors")]
    public Task<IReadOnlyList<DoctorDto>> Doctors(CancellationToken ct) => _doctors.GetAllAsync(ct);

    [HttpGet("appointments")]
    public Task<IReadOnlyList<AppointmentDto>> Appointments(CancellationToken ct) => _portal.GetMyAppointmentsAsync(ct);

    [HttpPost("appointments")]
    public Task<AppointmentDto> Book(SelfBookRequest request, CancellationToken ct) => _portal.BookAsync(request, ct);

    [HttpGet("prescriptions")]
    public Task<IReadOnlyList<PrescriptionDto>> Prescriptions(CancellationToken ct) => _portal.GetMyPrescriptionsAsync(ct);

    [HttpGet("records")]
    public Task<IReadOnlyList<MedicalRecordDto>> Records(CancellationToken ct) => _portal.GetMyRecordsAsync(ct);

    [HttpGet("records/{id:guid}/file")]
    public async Task<IActionResult> RecordFile(Guid id, CancellationToken ct)
    {
        var file = await _portal.GetMyRecordFileAsync(id, ct);
        return File(file.Content, file.ContentType, file.FileName);
    }

    [HttpGet("refills")]
    public Task<IReadOnlyList<RefillRequestDto>> Refills(CancellationToken ct) => _portal.GetMyRefillsAsync(ct);

    [HttpPost("refills")]
    public Task<RefillRequestDto> RequestRefill(CreateRefillRequest request, CancellationToken ct) => _portal.RequestRefillAsync(request, ct);

    [HttpGet("messages")]
    public Task<IReadOnlyList<MessageDto>> Messages(CancellationToken ct) => _portal.GetMyMessagesAsync(ct);

    [HttpPost("messages")]
    public Task<MessageDto> SendMessage(SendMessageRequest request, CancellationToken ct) => _portal.SendMessageAsync(request, ct);
}
