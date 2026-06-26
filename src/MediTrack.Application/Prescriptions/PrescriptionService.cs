using MediTrack.Application.Abstractions;
using MediTrack.Application.Common;
using MediTrack.Application.Events;
using MediTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Application.Prescriptions;

public class PrescriptionService : IPrescriptionService
{
    private readonly IApplicationDbContext _db;
    private readonly IEventPublisher _events;
    private readonly IAuditLogger _audit;

    public PrescriptionService(IApplicationDbContext db, IEventPublisher events, IAuditLogger audit)
    {
        _db = db;
        _events = events;
        _audit = audit;
    }

    public async Task<PrescriptionDto> CreateAsync(CreatePrescriptionRequest request, CancellationToken ct = default)
    {
        var appt = await _db.Appointments.FirstOrDefaultAsync(a => a.Id == request.AppointmentId, ct)
            ?? throw AppException.NotFound("Appointment");

        var p = new Prescription
        {
            AppointmentId = request.AppointmentId,
            Medication = request.Medication,
            Dosage = request.Dosage,
            Frequency = request.Frequency,
            ExpiryDate = request.ExpiryDate
        };
        _db.Prescriptions.Add(p);
        await _db.SaveChangesAsync(ct);

        await _events.PublishAsync(Topics.PrescriptionCreated, p.Id.ToString(),
            new PrescriptionCreatedEvent(p.Id, p.AppointmentId, appt.PatientId, p.Medication), ct);
        await _audit.LogAsync("PrescriptionCreated", "Prescription", p.Id.ToString(), ct: ct);

        return Map(p);
    }

    // Uses the meditrack_active_prescriptions() stored procedure.
    public async Task<IReadOnlyList<PrescriptionDto>> GetActiveForPatientAsync(Guid patientId, CancellationToken ct = default) =>
        await _db.Database.QueryAsync(
            "SELECT * FROM meditrack_active_prescriptions(@patient)",
            r => new PrescriptionDto(
                r.GetGuid(0), r.GetGuid(1), r.GetString(2), r.GetString(3), r.GetString(4),
                r.IsDBNull(5) ? null : r.GetFieldValue<DateOnly>(5)),
            ct, ("patient", patientId));

    private static PrescriptionDto Map(Prescription p) =>
        new(p.Id, p.AppointmentId, p.Medication, p.Dosage, p.Frequency, p.ExpiryDate);
}
