using MediTrack.Api.Security;
using MediTrack.Application.Abstractions;
using MediTrack.Application.Appointments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediTrack.Api.Controllers;

[ApiController]
[Authorize(Roles = Roles.Staff)]
[Route("api/appointments")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointments;

    public AppointmentsController(IAppointmentService appointments) => _appointments = appointments;

    [HttpGet("{id:guid}")]
    public Task<AppointmentDto> Get(Guid id, CancellationToken ct) => _appointments.GetByIdAsync(id, ct);

    [HttpGet("today")]
    public Task<IReadOnlyList<AppointmentDto>> Today([FromQuery] Guid? doctorId, CancellationToken ct)
        => _appointments.GetTodayAsync(doctorId, ct);

    [HttpPost]
    [Authorize(Roles = Roles.Receptionist)]
    public async Task<ActionResult<AppointmentDto>> Create(CreateAppointmentRequest request, CancellationToken ct)
    {
        var created = await _appointments.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}/diagnosis")]
    [Authorize(Roles = Roles.Doctor)]
    public Task<AppointmentDto> SetDiagnosis(Guid id, UpdateDiagnosisRequest request, CancellationToken ct)
        => _appointments.SetDiagnosisAsync(id, request, ct);

    [HttpPut("{id:guid}/status")]
    public Task<AppointmentDto> SetStatus(Guid id, UpdateAppointmentStatusRequest request, CancellationToken ct)
        => _appointments.SetStatusAsync(id, request, ct);
}
