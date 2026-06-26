using MediTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MediTrack.Infrastructure.Persistence;

public class UserConfig : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> b)
    {
        b.ToTable("users");
        b.HasKey(x => x.Id);
        b.Property(x => x.Email).IsRequired().HasMaxLength(256);
        b.HasIndex(x => x.Email).IsUnique();
        b.Property(x => x.PasswordHash).IsRequired();
        b.Property(x => x.FullName).IsRequired().HasMaxLength(200);
        b.Property(x => x.Role).HasConversion<int>();
    }
}

public class DoctorConfig : IEntityTypeConfiguration<Doctor>
{
    public void Configure(EntityTypeBuilder<Doctor> b)
    {
        b.ToTable("doctors");
        b.HasKey(x => x.Id);
        b.Property(x => x.FullName).IsRequired().HasMaxLength(200);
        b.Property(x => x.Specialty).IsRequired().HasMaxLength(150);
        b.HasOne(x => x.User).WithOne(u => u.Doctor)
            .HasForeignKey<Doctor>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        b.HasIndex(x => x.UserId).IsUnique();
    }
}

public class PatientConfig : IEntityTypeConfiguration<Patient>
{
    public void Configure(EntityTypeBuilder<Patient> b)
    {
        b.ToTable("patients");
        b.HasKey(x => x.Id);
        b.Property(x => x.FullName).IsRequired().HasMaxLength(200);
        b.Property(x => x.BloodType).HasMaxLength(3);
        b.Property(x => x.Phone).HasMaxLength(40);
        b.Property(x => x.Email).HasMaxLength(256);
        b.HasIndex(x => x.FullName);
        b.HasOne(x => x.User).WithOne()
            .HasForeignKey<Patient>(x => x.UserId).OnDelete(DeleteBehavior.SetNull);
        b.HasIndex(x => x.UserId).IsUnique();
    }
}

public class RefillRequestConfig : IEntityTypeConfiguration<RefillRequest>
{
    public void Configure(EntityTypeBuilder<RefillRequest> b)
    {
        b.ToTable("refill_requests");
        b.HasKey(x => x.Id);
        b.Property(x => x.Status).HasConversion<int>();
        b.Property(x => x.PatientNote).HasMaxLength(1000);
        b.Property(x => x.ResponseNote).HasMaxLength(1000);
        b.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne(x => x.Prescription).WithMany().HasForeignKey(x => x.PrescriptionId).OnDelete(DeleteBehavior.Cascade);
        b.HasIndex(x => x.Status);
    }
}

public class MessageConfig : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> b)
    {
        b.ToTable("messages");
        b.HasKey(x => x.Id);
        b.Property(x => x.SenderName).IsRequired().HasMaxLength(200);
        b.Property(x => x.Body).IsRequired().HasMaxLength(4000);
        b.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
        b.HasIndex(x => new { x.PatientId, x.CreatedAt });
    }
}

public class AppointmentConfig : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> b)
    {
        b.ToTable("appointments");
        b.HasKey(x => x.Id);
        b.Property(x => x.Status).HasConversion<int>();
        b.Property(x => x.Reason).HasMaxLength(1000);
        b.HasOne(x => x.Patient).WithMany(p => p.Appointments)
            .HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne(x => x.Doctor).WithMany(d => d.Appointments)
            .HasForeignKey(x => x.DoctorId).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(x => x.ScheduledAt);
        b.HasIndex(x => new { x.DoctorId, x.ScheduledAt });
    }
}

public class PrescriptionConfig : IEntityTypeConfiguration<Prescription>
{
    public void Configure(EntityTypeBuilder<Prescription> b)
    {
        b.ToTable("prescriptions");
        b.HasKey(x => x.Id);
        b.Property(x => x.Medication).IsRequired().HasMaxLength(200);
        b.Property(x => x.Dosage).IsRequired().HasMaxLength(100);
        b.Property(x => x.Frequency).IsRequired().HasMaxLength(100);
        b.HasOne(x => x.Appointment).WithMany(a => a.Prescriptions)
            .HasForeignKey(x => x.AppointmentId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class MedicalRecordConfig : IEntityTypeConfiguration<MedicalRecord>
{
    public void Configure(EntityTypeBuilder<MedicalRecord> b)
    {
        b.ToTable("medical_records");
        b.HasKey(x => x.Id);
        b.Property(x => x.FileName).IsRequired().HasMaxLength(400);
        b.Property(x => x.BlobKey).IsRequired().HasMaxLength(500);
        b.Property(x => x.RecordType).HasConversion<int>();
        b.Property(x => x.SummaryStatus).HasConversion<int>();
        b.HasOne(x => x.Patient).WithMany(p => p.MedicalRecords)
            .HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class AuditLogConfig : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> b)
    {
        b.ToTable("audit_logs");
        b.HasKey(x => x.Id);
        b.Property(x => x.Action).IsRequired().HasMaxLength(100);
        b.Property(x => x.EntityType).IsRequired().HasMaxLength(100);
        b.Property(x => x.EntityId).HasMaxLength(100);
        b.HasIndex(x => x.Timestamp);
        b.HasIndex(x => new { x.EntityType, x.EntityId });
    }
}
