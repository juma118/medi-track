using MediTrack.Application.Abstractions;
using MediTrack.Application.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediTrack.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("login")]
    [AllowAnonymous]
    public Task<AuthResponse> Login(LoginRequest request, CancellationToken ct) => _auth.LoginAsync(request, ct);

    [HttpPost("refresh")]
    [AllowAnonymous]
    public Task<AuthResponse> Refresh(RefreshRequest request, CancellationToken ct) => _auth.RefreshAsync(request, ct);
}
