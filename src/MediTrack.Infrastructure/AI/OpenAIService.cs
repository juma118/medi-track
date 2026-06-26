using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using MediTrack.Application.AI;
using Microsoft.Extensions.Options;

namespace MediTrack.Infrastructure.AI;


public class OpenAIService : IAIService
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private readonly HttpClient _http;
    private readonly AiOptions _opt;

    public OpenAIService(HttpClient http, IOptions<AiOptions> opt)
    {
        _opt = opt.Value;
        _http = http;
        _http.BaseAddress = new Uri(string.IsNullOrWhiteSpace(_opt.BaseUrl) ? "https://api.openai.com" : _opt.BaseUrl);
        _http.DefaultRequestHeaders.Authorization = new("Bearer", _opt.ApiKey);
    }

    public async Task<SymptomAnalysisResult> AnalyzeSymptomsAsync(string symptoms, CancellationToken ct = default)
    {
        const string sys = "You are a clinical decision-support assistant for licensed doctors. " +
            "Given symptoms, return STRICT JSON with keys: possibleConditions (string[]), urgency ('Low'|'Medium'|'High'), " +
            "suggestedTests (string[]), disclaimer (string). No prose outside JSON.";
        var json = await CompleteJsonAsync(sys, $"Symptoms: {symptoms}", ct);
        return JsonSerializer.Deserialize<SymptomAnalysisResult>(json, Json)
            ?? throw new InvalidOperationException("AI returned unparseable symptom analysis.");
    }

    public async Task<RecordSummary> SummarizeMedicalRecordAsync(string recordText, CancellationToken ct = default)
    {
        const string sys = "Summarize this medical record. Return STRICT JSON with keys: overview (string), " +
            "keyFindings (string[]), medications (string[]), allergies (string[]), recommendations (string[]). No prose outside JSON.";
        var json = await CompleteJsonAsync(sys, recordText, ct);
        return JsonSerializer.Deserialize<RecordSummary>(json, Json)
            ?? throw new InvalidOperationException("AI returned unparseable record summary.");
    }

    public async Task<string> ChatWithPatientHistoryAsync(string question, string patientContext, CancellationToken ct = default)
    {
        const string sys = "You answer doctor questions about a specific patient using ONLY the provided context. " +
            "If the answer is not in the context, say so. Be concise and clinically precise.";
        var user = $"PATIENT CONTEXT:\n{patientContext}\n\nQUESTION: {question}";
        return await CompleteTextAsync(sys, user, ct);
    }

    private async Task<string> CompleteTextAsync(string system, string user, CancellationToken ct)
    {
        var req = new ChatRequest(_opt.Model,
            new[] { new ChatMessage("system", system), new ChatMessage("user", user) }, null);
        var resp = await PostAsync(req, ct);
        return resp.Choices.FirstOrDefault()?.Message.Content ?? "";
    }

    private async Task<string> CompleteJsonAsync(string system, string user, CancellationToken ct)
    {
        var req = new ChatRequest(_opt.Model,
            new[] { new ChatMessage("system", system), new ChatMessage("user", user) },
            new ResponseFormat("json_object"));
        var resp = await PostAsync(req, ct);
        return resp.Choices.FirstOrDefault()?.Message.Content ?? "{}";
    }

    private async Task<ChatResponse> PostAsync(ChatRequest req, CancellationToken ct)
    {
        using var httpResp = await _http.PostAsJsonAsync("/v1/chat/completions", req, Json, ct);
        httpResp.EnsureSuccessStatusCode();
        return await httpResp.Content.ReadFromJsonAsync<ChatResponse>(Json, ct)
            ?? throw new InvalidOperationException("Empty AI response.");
    }

    // ----- OpenAI wire models -----
    private record ChatRequest(string Model, ChatMessage[] Messages,
        [property: JsonPropertyName("response_format")] ResponseFormat? ResponseFormat);
    private record ChatMessage(string Role, string Content);
    private record ResponseFormat(string Type);
    private record ChatResponse(Choice[] Choices);
    private record Choice(ChatMessage Message);
}
