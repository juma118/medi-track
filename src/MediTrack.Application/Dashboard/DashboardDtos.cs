namespace MediTrack.Application.Dashboard;

public record DashboardStatsDto(
    int TotalPatients,
    int TodaysAppointments,
    int PendingAppointments,
    int ActivePrescriptions,
    int NewPatientsThisMonth,
    IReadOnlyList<AppointmentsByDayDto> AppointmentsLast7Days);

public record AppointmentsByDayDto(DateOnly Day, int Count);
