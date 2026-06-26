namespace MediTrack.Application.AI;

public record SymptomAnalysisResult(
    IReadOnlyList<string> PossibleConditions,
    string Urgency,                 // Low | Medium | High
    IReadOnlyList<string> SuggestedTests,
    string Disclaimer);

public record RecordSummary(
    string Overview,
    IReadOnlyList<string> KeyFindings,
    IReadOnlyList<string> Medications,
    IReadOnlyList<string> Allergies,
    IReadOnlyList<string> Recommendations);

/// <summary>Low-level LLM client (implemented in Infrastructure against OpenAI/Claude).</summary>
public interface IAIService
{
    Task<SymptomAnalysisResult> AnalyzeSymptomsAsync(string symptoms, CancellationToken ct = default);
    Task<RecordSummary> SummarizeMedicalRecordAsync(string recordText, CancellationToken ct = default);
    Task<string> ChatWithPatientHistoryAsync(string question, string patientContext, CancellationToken ct = default);
}

// ----- API-facing request/response DTOs -----

public record AnalyzeSymptomsRequest(Guid PatientId, string Symptoms);

public record PatientChatRequest(string Question);

public record PatientChatResponse(string Answer);
