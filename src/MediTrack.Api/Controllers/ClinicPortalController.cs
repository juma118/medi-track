using MediTrack.Api.Security;
using MediTrack.Application.Abstractions;
using MediTrack.Application.Portal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediTrack.Api.Controllers;

[ApiController]
[Authorize(Roles = Roles.Staff)]
[Route("api")]
public class ClinicPortalController : ControllerBase
{
    private readonly IClinicPortalService _clinic;

    public ClinicPortalController(IClinicPortalService clinic) => _clinic = clinic;

    [HttpPost("patients/{patientId:guid}/account")]
    [Authorize(Roles = Roles.Receptionist)]
    public Task<PatientAccountResult> CreateAccount(Guid patientId, CreatePatientAccountRequest request, CancellationToken ct)
        => _clinic.CreatePatientAccountAsync(patientId, request, ct);

    [HttpGet("refill-requests")]
    public Task<IReadOnlyList<RefillRequestDto>> PendingRefills(CancellationToken ct) => _clinic.GetPendingRefillsAsync(ct);

    [HttpPut("refill-requests/{id:guid}")]
    [Authorize(Roles = Roles.Doctor)]
    public Task<RefillRequestDto> ResolveRefill(Guid id, ResolveRefillRequest request, CancellationToken ct)
        => _clinic.ResolveRefillAsync(id, request, ct);

    [HttpGet("patients/{patientId:guid}/messages")]
    public Task<IReadOnlyList<MessageDto>> Thread(Guid patientId, CancellationToken ct) => _clinic.GetThreadAsync(patientId, ct);

    [HttpPost("patients/{patientId:guid}/messages")]
    public Task<MessageDto> Reply(Guid patientId, SendMessageRequest request, CancellationToken ct) => _clinic.ReplyAsync(patientId, request, ct);
}
