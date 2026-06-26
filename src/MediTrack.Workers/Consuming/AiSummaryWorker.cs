using MediTrack.Application.Abstractions;
using MediTrack.Application.AI;
using MediTrack.Application.Events;
using MediTrack.Domain.Enums;
using MediTrack.Infrastructure;
using MediTrack.Infrastructure.Messaging;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace MediTrack.Workers.Consuming;

/// <summary>Consumes MedicalRecordUploaded → extracts text → summarizes via AI → writes summary back.</summary>
public class AiSummaryWorker : KafkaConsumerBase<MedicalRecordUploadedEvent>
{
    protected override string Topic => Topics.MedicalRecordUploaded;
    protected override string GroupId => "meditrack-ai-summary";

    public AiSummaryWorker(IOptions<KafkaOptions> kafka, IServiceProvider services, ILogger<AiSummaryWorker> logger)
        : base(kafka, services, logger) { }

    protected override async Task HandleAsync(MedicalRecordUploadedEvent msg, IServiceProvider scope, CancellationToken ct)
    {
        var db = scope.GetRequiredService<IApplicationDbContext>();
        var storage = scope.GetRequiredService<IFileStorage>();
        var extractor = scope.GetRequiredService<IDocumentTextExtractor>();
        var ai = scope.GetRequiredService<IAIService>();
        var events = scope.GetRequiredService<IEventPublisher>();

        var record = await db.MedicalRecords.FirstOrDefaultAsync(r => r.Id == msg.RecordId, ct);
        if (record is null) return;

        record.SummaryStatus = SummaryStatus.Processing;
        await db.SaveChangesAsync(ct);

        try
        {
            await using var file = await storage.OpenReadAsync(msg.BlobKey, ct);
            var text = await extractor.ExtractTextAsync(file, msg.FileName, ct);

            var summary = await ai.SummarizeMedicalRecordAsync(text, ct);
            record.AISummary = Format(summary);
            record.SummaryStatus = SummaryStatus.Ready;
            await db.SaveChangesAsync(ct);

            // Notify clients in real time that the summary is ready.
            await events.PublishAsync(Topics.MedicalRecordSummarized, record.Id.ToString(),
                new MedicalRecordSummarizedEvent(record.Id, record.PatientId, record.FileName, "Ready"), ct);
        }
        catch (Exception)
        {
            record.SummaryStatus = SummaryStatus.Failed;
            await db.SaveChangesAsync(ct);
            throw;
        }
    }

    private static string Format(RecordSummary s)
    {
        var lines = new List<string> { s.Overview };
        if (s.KeyFindings.Any()) lines.Add("Key findings: " + string.Join("; ", s.KeyFindings));
        if (s.Medications.Any()) lines.Add("Medications: " + string.Join("; ", s.Medications));
        if (s.Allergies.Any()) lines.Add("Allergies: " + string.Join("; ", s.Allergies));
        if (s.Recommendations.Any()) lines.Add("Recommendations: " + string.Join("; ", s.Recommendations));
        return string.Join("\n", lines);
    }
}
