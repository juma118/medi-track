using MediTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace MediTrack.Application.Abstractions;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Doctor> Doctors { get; }
    DbSet<Patient> Patients { get; }
    DbSet<Appointment> Appointments { get; }
    DbSet<Prescription> Prescriptions { get; }
    DbSet<MedicalRecord> MedicalRecords { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<RefillRequest> RefillRequests { get; }
    DbSet<Message> Messages { get; }

    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
