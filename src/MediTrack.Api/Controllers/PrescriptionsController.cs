using MediTrack.Api.Security;
using MediTrack.Application.Abstractions;
using MediTrack.Application.Prescriptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediTrack.Api.Controllers;

[ApiController]
[Authorize(Roles = Roles.Staff)]
[Route("api/prescriptions")]
public class PrescriptionsController : ControllerBase
{
    private readonly IPrescriptionService _prescriptions;

    public PrescriptionsController(IPrescriptionService prescriptions) => _prescriptions = prescriptions;

    [HttpPost]
    [Authorize(Roles = Roles.Doctor)]
    public Task<PrescriptionDto> Create(CreatePrescriptionRequest request, CancellationToken ct)
        => _prescriptions.CreateAsync(request, ct);
}
