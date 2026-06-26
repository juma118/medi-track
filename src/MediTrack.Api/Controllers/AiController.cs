using MediTrack.Api.Security;
using MediTrack.Application.Abstractions;
using MediTrack.Application.AI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace MediTrack.Api.Controllers;

[ApiController]
[Authorize(Roles = Roles.Doctor)]   // AI tools are doctor-only per RBAC matrix
[EnableRateLimiting("ai")]          // protect costly LLM calls
[Route("api/ai")]
public class AiController : ControllerBase
{
    private readonly IAiAssistantService _ai;

    public AiController(IAiAssistantService ai) => _ai = ai;

    [HttpPost("analyze-symptoms")]
    public Task<SymptomAnalysisResult> AnalyzeSymptoms(AnalyzeSymptomsRequest request, CancellationToken ct)
        => _ai.AnalyzeSymptomsAsync(request, ct);

    [HttpPost("patients/{patientId:guid}/chat")]
    public Task<PatientChatResponse> Chat(Guid patientId, PatientChatRequest request, CancellationToken ct)
        => _ai.ChatAsync(patientId, request, ct);
}
