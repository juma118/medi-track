using MediTrack.Domain.Common;
using MediTrack.Domain.Enums;

namespace MediTrack.Domain.Entities;

public class MedicalRecord : AuditableEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = default!;

    public string FileName { get; set; } = default!;
    public string BlobKey { get; set; } = default!;
    public RecordType RecordType { get; set; } = RecordType.Other;

    public string? AISummary { get; set; }
    public SummaryStatus SummaryStatus { get; set; } = SummaryStatus.Pending;
}
