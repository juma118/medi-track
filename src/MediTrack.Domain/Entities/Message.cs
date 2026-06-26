namespace MediTrack.Domain.Entities;

/// <summary>A secure message in a patient&lt;-&gt;clinic thread (keyed by PatientId).</summary>
public class Message
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = default!;

    public Guid SenderUserId { get; set; }
    public string SenderName { get; set; } = default!;
    public bool FromPatient { get; set; }

    public string Body { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
}
