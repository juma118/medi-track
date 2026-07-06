namespace MediTrack.Api.Security;

public static class Roles
{
    public const string Doctor = "Doctor";
    public const string Receptionist = "Receptionist";
    public const string Patient = "Patient";

    public const string Staff = "Doctor,Receptionist";
}
