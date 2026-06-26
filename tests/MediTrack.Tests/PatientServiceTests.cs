using MediTrack.Application.Abstractions;
using MediTrack.Application.Common;
using MediTrack.Application.Patients;
using NSubstitute;

namespace MediTrack.Tests;

public class PatientServiceTests
{
    [Fact]
    public async Task Create_then_GetById_roundtrips()
    {
        using var db = TestDbContextFactory.Create();
        var audit = Substitute.For<IAuditLogger>();
        var svc = new PatientService(db, audit);

        var created = await svc.CreateAsync(new CreatePatientRequest(
            "Alice Test", new DateOnly(1991, 2, 3), "A+", "555", "alice@x.com", "none"));

        var fetched = await svc.GetByIdAsync(created.Id);

        Assert.Equal("Alice Test", fetched.FullName);
        Assert.Equal(created.Id, fetched.Id);
        await audit.Received().LogAsync("PatientCreated", "Patient", Arg.Any<string>(), Arg.Any<string?>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetById_missing_throws_NotFound()
    {
        using var db = TestDbContextFactory.Create();
        var svc = new PatientService(db, Substitute.For<IAuditLogger>());

        var ex = await Assert.ThrowsAsync<AppException>(() => svc.GetByIdAsync(Guid.NewGuid()));
        Assert.Equal(404, ex.StatusCode);
    }
}
