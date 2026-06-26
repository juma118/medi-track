using MediTrack.Api.Security;
using MediTrack.Application.Abstractions;
using MediTrack.Application.Doctors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediTrack.Api.Controllers;

[ApiController]
[Authorize(Roles = Roles.Staff)]
[Route("api/doctors")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _doctors;

    public DoctorsController(IDoctorService doctors) => _doctors = doctors;

    [HttpGet]
    public Task<IReadOnlyList<DoctorDto>> GetAll(CancellationToken ct) => _doctors.GetAllAsync(ct);
}
