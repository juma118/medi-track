using MediTrack.Application.AI;

namespace MediTrack.Infrastructure.AI;

public class StubAIService : IAIService
{
    private const string Disclaimer = "AI-generated suggestion. Not a medical diagnosis. Clinical judgment required.";

    public Task<SymptomAnalysisResult> AnalyzeSymptomsAsync(string symptoms, CancellationToken ct = default)
    {
        var lower = symptoms.ToLowerInvariant();
        var urgency = lower.Contains("chest pain") || lower.Contains("shortness of breath") || lower.Contains("bleeding")
            ? "High"
            : lower.Contains("fever") || lower.Contains("severe") ? "Medium" : "Low";

        return Task.FromResult(new SymptomAnalysisResult(
            PossibleConditions: new[] { "Viral infection", "Stress-related symptoms", "Requires further evaluation" },
            Urgency: urgency,
            SuggestedTests: new[] { "Complete blood count (CBC)", "Vital signs review" },
            Disclaimer: Disclaimer));
    }

    public Task<RecordSummary> SummarizeMedicalRecordAsync(string recordText, CancellationToken ct = default)
    {
        var preview = recordText.Length > 200 ? recordText[..200] + "…" : recordText;
        return Task.FromResult(new RecordSummary(
            Overview: $"Auto-summary (stub) of a {recordText.Length}-character record. Preview: {preview}",
            KeyFindings: new[] { "No structured findings extracted in stub mode." },
            Medications: Array.Empty<string>(),
            Allergies: Array.Empty<string>(),
            Recommendations: new[] { "Review original document; configure an AI provider for real summaries." }));
    }

    public Task<string> ChatWithPatientHistoryAsync(string question, string patientContext, CancellationToken ct = default)
    {
        return Task.FromResult(
            $"(stub answer) Based on the patient record, here is context relevant to \"{question}\". " +
            "Configure an AI provider (OpenAI/Claude) for grounded natural-language answers.\n\n" +
            "Context used:\n" + (patientContext.Length > 600 ? patientContext[..600] + "…" : patientContext));
    }
}
