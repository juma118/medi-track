using FluentValidation;
using MediTrack.Application.AI;
using MediTrack.Application.Appointments;
using MediTrack.Application.Auth;
using MediTrack.Application.MedicalRecords;
using MediTrack.Application.Patients;
using MediTrack.Application.Portal;
using MediTrack.Application.Prescriptions;

namespace MediTrack.Application.Validation;

public class SelfBookRequestValidator : AbstractValidator<SelfBookRequest>
{
    public SelfBookRequestValidator()
    {
        RuleFor(x => x.DoctorId).NotEmpty();
        RuleFor(x => x.ScheduledAt).GreaterThan(DateTime.UtcNow.AddMinutes(-1));
    }
}

public class CreateRefillRequestValidator : AbstractValidator<CreateRefillRequest>
{
    public CreateRefillRequestValidator() => RuleFor(x => x.PrescriptionId).NotEmpty();
}

public class SendMessageRequestValidator : AbstractValidator<SendMessageRequest>
{
    public SendMessageRequestValidator() => RuleFor(x => x.Body).NotEmpty().MaximumLength(4000);
}

public class CreatePatientAccountRequestValidator : AbstractValidator<CreatePatientAccountRequest>
{
    public CreatePatientAccountRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class CreatePatientRequestValidator : AbstractValidator<CreatePatientRequest>
{
    public CreatePatientRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DateOfBirth)
            .LessThan(DateOnly.FromDateTime(DateTime.UtcNow)).WithMessage("Date of birth must be in the past.");
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.BloodType).MaximumLength(3);
    }
}

public class UpdatePatientRequestValidator : AbstractValidator<UpdatePatientRequest>
{
    public UpdatePatientRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DateOfBirth).LessThan(DateOnly.FromDateTime(DateTime.UtcNow));
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}

public class CreateAppointmentRequestValidator : AbstractValidator<CreateAppointmentRequest>
{
    public CreateAppointmentRequestValidator()
    {
        RuleFor(x => x.PatientId).NotEmpty();
        RuleFor(x => x.DoctorId).NotEmpty();
        RuleFor(x => x.ScheduledAt)
            .GreaterThan(DateTime.UtcNow.AddMinutes(-1)).WithMessage("Appointment must be scheduled in the future.");
    }
}

public class CreatePrescriptionRequestValidator : AbstractValidator<CreatePrescriptionRequest>
{
    public CreatePrescriptionRequestValidator()
    {
        RuleFor(x => x.AppointmentId).NotEmpty();
        RuleFor(x => x.Medication).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Dosage).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Frequency).NotEmpty().MaximumLength(100);
    }
}

public class AnalyzeSymptomsRequestValidator : AbstractValidator<AnalyzeSymptomsRequest>
{
    public AnalyzeSymptomsRequestValidator()
    {
        RuleFor(x => x.PatientId).NotEmpty();
        RuleFor(x => x.Symptoms).NotEmpty().MinimumLength(3).MaximumLength(4000);
    }
}

public class PatientChatRequestValidator : AbstractValidator<PatientChatRequest>
{
    public PatientChatRequestValidator()
    {
        RuleFor(x => x.Question).NotEmpty().MaximumLength(1000);
    }
}

public class UploadMedicalRecordRequestValidator : AbstractValidator<UploadMedicalRecordRequest>
{
    public UploadMedicalRecordRequestValidator()
    {
        RuleFor(x => x.PatientId).NotEmpty();
    }
}
