using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediTrack.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SearchPatientsBloodFilter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Replace search function with an added optional blood-type filter.
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS meditrack_search_patients(text, int, int);");
            migrationBuilder.Sql(@"
CREATE OR REPLACE FUNCTION meditrack_search_patients(p_term text, p_blood text, p_limit int, p_offset int)
RETURNS TABLE(""Id"" uuid, ""FullName"" text, ""DateOfBirth"" date, ""BloodType"" text,
              ""Phone"" text, ""Email"" text, ""MedicalHistory"" text, ""CreatedAt"" timestamp, total_count bigint)
LANGUAGE sql STABLE AS $$
  SELECT p.""Id"", p.""FullName"", p.""DateOfBirth"", p.""BloodType"", p.""Phone"", p.""Email"",
         p.""MedicalHistory"", p.""CreatedAt"", COUNT(*) OVER() AS total_count
  FROM patients p
  WHERE (p_term IS NULL OR p_term = ''
         OR p.""FullName"" ILIKE '%' || p_term || '%'
         OR p.""Email"" ILIKE '%' || p_term || '%'
         OR p.""Phone"" ILIKE '%' || p_term || '%')
    AND (p_blood IS NULL OR p_blood = '' OR p.""BloodType"" = p_blood)
  ORDER BY p.""FullName""
  LIMIT p_limit OFFSET p_offset;
$$;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS meditrack_search_patients(text, text, int, int);");
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
        }
    }
}
