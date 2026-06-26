using MediTrack.Api.Security;
using MediTrack.Application.Abstractions;
using MediTrack.Application.Appointments;
using MediTrack.Application.Common;
using MediTrack.Application.MedicalRecords;
using MediTrack.Application.Patients;
using MediTrack.Application.Prescriptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediTrack.Api.Controllers;

[ApiController]
[Authorize(Roles = Roles.Staff)]
[Route("api/patients")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patients;
    private readonly IAppointmentService _appointments;
    private readonly IPrescriptionService _prescriptions;
    private readonly IMedicalRecordService _records;

    public PatientsController(
        IPatientService patients,
        IAppointmentService appointments,
        IPrescriptionService prescriptions,
        IMedicalRecordService records)
    {
        _patients = patients;
        _appointments = appointments;
        _prescriptions = prescriptions;
        _records = records;
    }

    [HttpGet]
    public Task<PagedResult<PatientDto>> Search([FromQuery] string? search, [FromQuery] string? bloodType, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => _patients.SearchAsync(new PatientSearchQuery(search, bloodType, page, pageSize), ct);

    [HttpGet("{id:guid}")]
    public Task<PatientDto> Get(Guid id, CancellationToken ct) => _patients.GetByIdAsync(id, ct);

    [HttpPost]
    [Authorize(Roles = Roles.Receptionist)]
    public async Task<ActionResult<PatientDto>> Create(CreatePatientRequest request, CancellationToken ct)
    {
        var created = await _patients.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.Receptionist)]
    public Task<PatientDto> Update(Guid id, UpdatePatientRequest request, CancellationToken ct)
        => _patients.UpdateAsync(id, request, ct);

    // ----- Nested reads for a patient -----

    [HttpGet("{id:guid}/appointments")]
    public Task<IReadOnlyList<AppointmentDto>> Appointments(Guid id, CancellationToken ct)
        => _appointments.GetForPatientAsync(id, ct);

    [HttpGet("{id:guid}/prescriptions")]
    public Task<IReadOnlyList<PrescriptionDto>> ActivePrescriptions(Guid id, CancellationToken ct)
        => _prescriptions.GetActiveForPatientAsync(id, ct);

    [HttpGet("{id:guid}/records")]
    public Task<IReadOnlyList<MedicalRecordDto>> Records(Guid id, CancellationToken ct)
        => _records.GetForPatientAsync(id, ct);
}
