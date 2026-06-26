using FluentValidation;
using MediTrack.Application.Abstractions;
using MediTrack.Application.AI;
using MediTrack.Application.Appointments;
using MediTrack.Application.Auth;
using MediTrack.Application.Dashboard;
using MediTrack.Application.Doctors;
using MediTrack.Application.MedicalRecords;
using MediTrack.Application.Patients;
using MediTrack.Application.Prescriptions;
using Microsoft.Extensions.DependencyInjection;

namespace MediTrack.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<Validation.LoginRequestValidator>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPatientService, PatientService>();
        services.AddScoped<IDoctorService, DoctorService>();
        services.AddScoped<IAppointmentService, AppointmentService>();
        services.AddScoped<IPrescriptionService, PrescriptionService>();
        services.AddScoped<IMedicalRecordService, MedicalRecordService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IAiAssistantService, AiAssistantService>();
        services.AddScoped<IPatientPortalService, Portal.PatientPortalService>();
        services.AddScoped<IClinicPortalService, Portal.ClinicPortalService>();

        return services;
    }
}
