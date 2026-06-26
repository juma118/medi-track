using MediTrack.Api.Security;
using MediTrack.Application.Abstractions;
using MediTrack.Application.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediTrack.Api.Controllers;

[ApiController]
[Authorize(Roles = Roles.Staff)]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboard;

    public DashboardController(IDashboardService dashboard) => _dashboard = dashboard;

    [HttpGet("stats")]
    public Task<DashboardStatsDto> Stats(CancellationToken ct) => _dashboard.GetStatsAsync(ct);
}
