using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediTrack.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class StoredProcedures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Dashboard KPI aggregates in a single call.
            migrationBuilder.Sql(@"
CREATE OR REPLACE FUNCTION meditrack_dashboard_stats()
RETURNS TABLE(total_patients bigint, todays_appointments bigint, pending_appointments bigint,
              active_prescriptions bigint, new_patients_this_month bigint)
LANGUAGE sql STABLE AS $$
  SELECT
    (SELECT COUNT(*) FROM patients),
    (SELECT COUNT(*) FROM appointments WHERE ""ScheduledAt"" >= CURRENT_DATE AND ""ScheduledAt"" < CURRENT_DATE + INTERVAL '1 day'),
    (SELECT COUNT(*) FROM appointments WHERE ""Status"" = 1 AND ""ScheduledAt"" >= CURRENT_DATE),
    (SELECT COUNT(*) FROM prescriptions WHERE ""ExpiryDate"" IS NULL OR ""ExpiryDate"" >= CURRENT_DATE),
    (SELECT COUNT(*) FROM patients WHERE ""CreatedAt"" >= date_trunc('month', CURRENT_DATE::timestamp));
$$;");

            // 2. Paginated patient search with total count (window function).
            migrationBuilder.Sql(@"
CREATE OR REPLACE FUNCTION meditrack_search_patients(p_term text, p_limit int, p_offset int)
RETURNS TABLE(""Id"" uuid, ""FullName"" text, ""DateOfBirth"" date, ""BloodType"" text,
              ""Phone"" text, ""Email"" text, ""MedicalHistory"" text, ""CreatedAt"" timestamp, total_count bigint)
LANGUAGE sql STABLE AS $$
  SELECT p.""Id"", p.""FullName"", p.""DateOfBirth"", p.""BloodType"", p.""Phone"", p.""Email"",
         p.""MedicalHistory"", p.""CreatedAt"", COUNT(*) OVER() AS total_count
  FROM patients p
  WHERE p_term IS NULL OR p_term = ''
     OR p.""FullName"" ILIKE '%' || p_term || '%'
     OR p.""Email"" ILIKE '%' || p_term || '%'
     OR p.""Phone"" ILIKE '%' || p_term || '%'
  ORDER BY p.""FullName""
  LIMIT p_limit OFFSET p_offset;
$$;");

            // 3. Today's appointments (optionally filtered by doctor), flattened with names.
            migrationBuilder.Sql(@"
CREATE OR REPLACE FUNCTION meditrack_today_appointments(p_doctor uuid)
RETURNS TABLE(""Id"" uuid, ""PatientId"" uuid, patient_name text, ""DoctorId"" uuid, doctor_name text,
              ""ScheduledAt"" timestamp, ""Status"" int, ""Reason"" text, ""Diagnosis"" text)
LANGUAGE sql STABLE AS $$
  SELECT a.""Id"", a.""PatientId"", p.""FullName"", a.""DoctorId"", d.""FullName"",
         a.""ScheduledAt"", a.""Status"", a.""Reason"", a.""Diagnosis""
  FROM appointments a
  JOIN patients p ON p.""Id"" = a.""PatientId""
  JOIN doctors d ON d.""Id"" = a.""DoctorId""
  WHERE a.""ScheduledAt"" >= CURRENT_DATE AND a.""ScheduledAt"" < CURRENT_DATE + INTERVAL '1 day'
    AND (p_doctor IS NULL OR a.""DoctorId"" = p_doctor)
  ORDER BY a.""ScheduledAt"";
$$;");

            // 4. Full appointment history for a patient (most recent first).
            migrationBuilder.Sql(@"
CREATE OR REPLACE FUNCTION meditrack_patient_full_history(p_patient uuid)
RETURNS TABLE(""Id"" uuid, ""PatientId"" uuid, patient_name text, ""DoctorId"" uuid, doctor_name text,
              ""ScheduledAt"" timestamp, ""Status"" int, ""Reason"" text, ""Diagnosis"" text)
LANGUAGE sql STABLE AS $$
  SELECT a.""Id"", a.""PatientId"", p.""FullName"", a.""DoctorId"", d.""FullName"",
         a.""ScheduledAt"", a.""Status"", a.""Reason"", a.""Diagnosis""
  FROM appointments a
  JOIN patients p ON p.""Id"" = a.""PatientId""
  JOIN doctors d ON d.""Id"" = a.""DoctorId""
  WHERE a.""PatientId"" = p_patient
  ORDER BY a.""ScheduledAt"" DESC;
$$;");

            // 5. Active prescriptions for a patient (not expired).
            migrationBuilder.Sql(@"
CREATE OR REPLACE FUNCTION meditrack_active_prescriptions(p_patient uuid)
RETURNS TABLE(""Id"" uuid, ""AppointmentId"" uuid, ""Medication"" text, ""Dosage"" text,
              ""Frequency"" text, ""ExpiryDate"" date)
LANGUAGE sql STABLE AS $$
  SELECT pr.""Id"", pr.""AppointmentId"", pr.""Medication"", pr.""Dosage"", pr.""Frequency"", pr.""ExpiryDate""
  FROM prescriptions pr
  JOIN appointments a ON a.""Id"" = pr.""AppointmentId""
  WHERE a.""PatientId"" = p_patient
    AND (pr.""ExpiryDate"" IS NULL OR pr.""ExpiryDate"" >= CURRENT_DATE)
  ORDER BY pr.""CreatedAt"" DESC;
$$;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS meditrack_dashboard_stats();");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS meditrack_search_patients(text, int, int);");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS meditrack_today_appointments(uuid);");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS meditrack_patient_full_history(uuid);");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS meditrack_active_prescriptions(uuid);");
        }
    }
}
