using MediTrack.Application.AI;
using MediTrack.Application.Patients;
using MediTrack.Application.Validation;

namespace MediTrack.Tests;

public class ValidatorTests
{
    [Fact]
    public void CreatePatient_rejects_future_dob()
    {
        var v = new CreatePatientRequestValidator();
        var req = new CreatePatientRequest("John", DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)), null, null, null, null);
        var result = v.Validate(req);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(req.DateOfBirth));
    }

    [Fact]
    public void CreatePatient_accepts_valid()
    {
        var v = new CreatePatientRequestValidator();
        var req = new CreatePatientRequest("Jane Doe", new DateOnly(1990, 1, 1), "O+", null, "jane@x.com", null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void AnalyzeSymptoms_rejects_empty()
    {
        var v = new AnalyzeSymptomsRequestValidator();
        var req = new AnalyzeSymptomsRequest(Guid.NewGuid(), "");
        Assert.False(v.Validate(req).IsValid);
    }
}
