using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediTrack.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PatientPortal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "patients",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    FromPatient = table.Column<bool>(type: "boolean", nullable: false),
                    Body = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_messages_patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "refill_requests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    PrescriptionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    PatientNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ResponseNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ResolvedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refill_requests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_refill_requests_patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_refill_requests_prescriptions_PrescriptionId",
                        column: x => x.PrescriptionId,
                        principalTable: "prescriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_patients_UserId",
                table: "patients",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_messages_PatientId_CreatedAt",
                table: "messages",
                columns: new[] { "PatientId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_refill_requests_PatientId",
                table: "refill_requests",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_refill_requests_PrescriptionId",
                table: "refill_requests",
                column: "PrescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_refill_requests_Status",
                table: "refill_requests",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_patients_users_UserId",
                table: "patients",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_patients_users_UserId",
                table: "patients");

            migrationBuilder.DropTable(
                name: "messages");

            migrationBuilder.DropTable(
                name: "refill_requests");

            migrationBuilder.DropIndex(
                name: "IX_patients_UserId",
                table: "patients");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "patients");
        }
    }
}
