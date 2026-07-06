using MediTrack.Application.Abstractions;
using MediTrack.Application.Events;
using MediTrack.Infrastructure;
using MediTrack.Infrastructure.Messaging;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace MediTrack.Workers.Consuming;

public class NotificationWorker : KafkaConsumerBase<AppointmentBookedEvent>
{
    protected override string Topic => Topics.AppointmentBooked;
    protected override string GroupId => "meditrack-notifications";

    private readonly ILogger<NotificationWorker> _logger;

    public NotificationWorker(IOptions<KafkaOptions> kafka, IServiceProvider services, ILogger<NotificationWorker> logger)
        : base(kafka, services, logger) => _logger = logger;

    protected override async Task HandleAsync(AppointmentBookedEvent msg, IServiceProvider scope, CancellationToken ct)
    {
        var db = scope.GetRequiredService<IApplicationDbContext>();
        var info = await db.Appointments.AsNoTracking()
            .Where(a => a.Id == msg.AppointmentId)
            .Select(a => new { Patient = a.Patient.FullName, a.Patient.Email, Doctor = a.Doctor.FullName })
            .FirstOrDefaultAsync(ct);

        if (info is null) return;

        _logger.LogInformation(
            "📧 Reminder: {Patient} ({Email}) has an appointment with Dr. {Doctor} at {Time:u}",
            info.Patient, info.Email ?? "no-email", info.Doctor, msg.ScheduledAt);
    }
}
