namespace MediTrack.Api.Security;

/// <summary>RBAC roles/policies. Role names match UserRole enum names (used as JWT role claim).</summary>
public static class Roles
{
    public const string Doctor = "Doctor";
    public const string Receptionist = "Receptionist";
    public const string Patient = "Patient";

    /// <summary>Clinic staff (either staff role).</summary>
    public const string Staff = "Doctor,Receptionist";
}
