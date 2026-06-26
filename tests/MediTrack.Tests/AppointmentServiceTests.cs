using MediTrack.Application.Abstractions;
using MediTrack.Application.Appointments;
using MediTrack.Application.Common;
using MediTrack.Domain.Entities;
using NSubstitute;

namespace MediTrack.Tests;

public class AppointmentServiceTests
{
    [Fact]
    public async Task Create_with_missing_patient_throws_NotFound()
    {
        using var db = TestDbContextFactory.Create();
        var svc = new AppointmentService(db, Substitute.For<IEventPublisher>(), Substitute.For<IAuditLogger>());

        var ex = await Assert.ThrowsAsync<AppException>(() =>
            svc.CreateAsync(new CreateAppointmentRequest(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddDays(1), "x")));
        Assert.Equal(404, ex.StatusCode);
    }

    [Fact]
    public async Task Create_publishes_AppointmentBooked_event()
    {
        using var db = TestDbContextFactory.Create();
        var patient = new Patient { FullName = "P", DateOfBirth = new DateOnly(1990, 1, 1) };
        var user = new User { Email = "d@x.com", PasswordHash = "h", FullName = "Dr D", Role = Domain.Enums.UserRole.Doctor };
        var doctor = new Doctor { FullName = "Dr D", Specialty = "GP", UserId = user.Id, User = user };
        db.Patients.Add(patient);
        db.Doctors.Add(doctor);
        await db.SaveChangesAsync();

        var events = Substitute.For<IEventPublisher>();
        var svc = new AppointmentService(db, events, Substitute.For<IAuditLogger>());

        var dto = await svc.CreateAsync(new CreateAppointmentRequest(patient.Id, doctor.Id, DateTime.UtcNow.AddDays(1), "checkup"));

        Assert.Equal(patient.Id, dto.PatientId);
        Assert.Equal("P", dto.PatientName);
        await events.Received().PublishAsync(
            MediTrack.Application.Events.Topics.AppointmentBooked,
            Arg.Any<string>(), Arg.Any<MediTrack.Application.Events.AppointmentBookedEvent>(), Arg.Any<CancellationToken>());
    }
}
