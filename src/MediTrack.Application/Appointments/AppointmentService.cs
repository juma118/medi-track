using System.Linq.Expressions;
using MediTrack.Application.Abstractions;
using MediTrack.Application.Common;
using MediTrack.Application.Events;
using MediTrack.Domain.Entities;
using MediTrack.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MediTrack.Application.Appointments;

public class AppointmentService : IAppointmentService
{
    private readonly IApplicationDbContext _db;
    private readonly IEventPublisher _events;
    private readonly IAuditLogger _audit;

    public AppointmentService(IApplicationDbContext db, IEventPublisher events, IAuditLogger audit)
    {
        _db = db;
        _events = events;
        _audit = audit;
    }

    public async Task<AppointmentDto> CreateAsync(CreateAppointmentRequest request, CancellationToken ct = default)
    {
        if (!await _db.Patients.AnyAsync(p => p.Id == request.PatientId, ct))
            throw AppException.NotFound("Patient");
        if (!await _db.Doctors.AnyAsync(d => d.Id == request.DoctorId, ct))
            throw AppException.NotFound("Doctor");

        var appt = new Appointment
        {
            PatientId = request.PatientId,
            DoctorId = request.DoctorId,
            ScheduledAt = request.ScheduledAt,
            Reason = request.Reason,
            Status = AppointmentStatus.Scheduled
        };
        _db.Appointments.Add(appt);
        await _db.SaveChangesAsync(ct);

        await _events.PublishAsync(Topics.AppointmentBooked, appt.Id.ToString(),
            new AppointmentBookedEvent(appt.Id, appt.PatientId, appt.DoctorId, appt.ScheduledAt), ct);
        await _audit.LogAsync("AppointmentBooked", "Appointment", appt.Id.ToString(), ct: ct);

        return await GetByIdAsync(appt.Id, ct);
    }

    public async Task<AppointmentDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var dto = await _db.Appointments.AsNoTracking()
            .Where(a => a.Id == id).Select(Projection).FirstOrDefaultAsync(ct);
        return dto ?? throw AppException.NotFound("Appointment");
    }

    // Uses the meditrack_patient_full_history() stored procedure.
    public Task<IReadOnlyList<AppointmentDto>> GetForPatientAsync(Guid patientId, CancellationToken ct = default) =>
        ReadAppointmentsAsync("SELECT * FROM meditrack_patient_full_history(@patient)", ct, ("patient", patientId));

    // Uses the meditrack_today_appointments() stored procedure.
    public Task<IReadOnlyList<AppointmentDto>> GetTodayAsync(Guid? doctorId, CancellationToken ct = default) =>
        ReadAppointmentsAsync("SELECT * FROM meditrack_today_appointments(@doctor)", ct, ("doctor", (object?)doctorId));

    private async Task<IReadOnlyList<AppointmentDto>> ReadAppointmentsAsync(string sql, CancellationToken ct, params (string, object?)[] ps) =>
        await _db.Database.QueryAsync(sql, r => new AppointmentDto(
            r.GetGuid(0), r.GetGuid(1), r.GetString(2), r.GetGuid(3), r.GetString(4),
            r.GetDateTime(5), (AppointmentStatus)r.GetInt32(6),
            r.IsDBNull(7) ? null : r.GetString(7),
            r.IsDBNull(8) ? null : r.GetString(8)), ct, ps);



    public async Task<AppointmentDto> SetDiagnosisAsync(Guid id, UpdateDiagnosisRequest request, CancellationToken ct = default)
    {
        var appt = await _db.Appointments.FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw AppException.NotFound("Appointment");
        appt.Diagnosis = request.Diagnosis;
        await _db.SaveChangesAsync(ct);
        await _audit.LogAsync("DiagnosisRecorded", "Appointment", id.ToString(), ct: ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<AppointmentDto> SetStatusAsync(Guid id, UpdateAppointmentStatusRequest request, CancellationToken ct = default)
    {
        var appt = await _db.Appointments.FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw AppException.NotFound("Appointment");
        appt.Status = request.Status;
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    // EF-translatable projection; navigation properties resolved via SQL joins.
    private static readonly Expression<Func<Appointment, AppointmentDto>> Projection = a => new AppointmentDto(
        a.Id, a.PatientId, a.Patient.FullName, a.DoctorId, a.Doctor.FullName,
        a.ScheduledAt, a.Status, a.Reason, a.Diagnosis);
}
