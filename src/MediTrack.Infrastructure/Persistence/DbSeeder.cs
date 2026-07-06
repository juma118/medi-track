using MediTrack.Application.Abstractions;
using MediTrack.Domain.Entities;
using MediTrack.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace MediTrack.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task MigrateAndSeedAsync(IServiceProvider sp, CancellationToken ct = default)
    {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        await db.Database.MigrateAsync(ct);

        if (await db.Users.AnyAsync(ct))
        {
            await EnsureDemoPatientAccountAsync(db, hasher, ct);   // idempotent top-up for existing DBs
            return;
        }

        // Doctor user + profile
        var doctorUser = new User
        {
            Email = "doctor@meditrack.dev",
            PasswordHash = hasher.Hash("Doctor123!"),
            FullName = "Dr. Alice Stone",
            Role = UserRole.Doctor
        };
        var receptionUser = new User
        {
            Email = "reception@meditrack.dev",
            PasswordHash = hasher.Hash("Reception123!"),
            FullName = "Rita Reyes",
            Role = UserRole.Receptionist
        };
        db.Users.AddRange(doctorUser, receptionUser);

        var doctor = new Doctor
        {
            FullName = "Dr. Alice Stone",
            Specialty = "Internal Medicine",
            UserId = doctorUser.Id,
            User = doctorUser
        };
        db.Doctors.Add(doctor);

        // Sample patients
        var patients = new[]
        {
            new Patient { FullName = "John Miller", DateOfBirth = new DateOnly(1985, 4, 12), BloodType = "O+", Phone = "555-0101", Email = "john.miller@example.com", MedicalHistory = "Hypertension." },
            new Patient { FullName = "Maria Garcia", DateOfBirth = new DateOnly(1992, 9, 3), BloodType = "A-", Phone = "555-0102", Email = "maria.garcia@example.com", MedicalHistory = "Asthma." },
            new Patient { FullName = "David Chen", DateOfBirth = new DateOnly(1978, 1, 25), BloodType = "B+", Phone = "555-0103", Email = "david.chen@example.com" },
        };
        db.Patients.AddRange(patients);
        await db.SaveChangesAsync(ct);

        await EnsureDemoPatientAccountAsync(db, hasher, ct);

        var appt = new Appointment
        {
            PatientId = patients[0].Id,
            DoctorId = doctor.Id,
            ScheduledAt = DateTime.UtcNow.Date.AddHours(10),
            Status = AppointmentStatus.Scheduled,
            Reason = "Routine blood pressure check"
        };
        db.Appointments.Add(appt);
        await db.SaveChangesAsync(ct);

        db.Prescriptions.Add(new Prescription
        {
            AppointmentId = appt.Id,
            Medication = "Lisinopril",
            Dosage = "10mg",
            Frequency = "Once daily",
            ExpiryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(6))
        });
        await db.SaveChangesAsync(ct);
    }

    private static async Task EnsureDemoPatientAccountAsync(ApplicationDbContext db, IPasswordHasher hasher, CancellationToken ct)
    {
        if (await db.Users.AnyAsync(u => u.Email == "patient@meditrack.dev", ct)) return;

        var patient = await db.Patients
            .Where(p => p.UserId == null)
            .OrderByDescending(p => p.Appointments.Count)
            .ThenBy(p => p.CreatedAt)
            .FirstOrDefaultAsync(ct);
        if (patient is null) return;

        var user = new User
        {
            Email = "patient@meditrack.dev",
            PasswordHash = hasher.Hash("Patient123!"),
            FullName = patient.FullName,
            Role = UserRole.Patient
        };
        db.Users.Add(user);
        patient.UserId = user.Id;
        await db.SaveChangesAsync(ct);
    }
}
