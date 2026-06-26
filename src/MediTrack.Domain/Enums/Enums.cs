namespace MediTrack.Domain.Enums;

public enum UserRole
{
    Doctor = 1,
    Receptionist = 2,
    Patient = 3
}

public enum RefillStatus
{
    Requested = 1,
    Approved = 2,
    Denied = 3
}

public enum AppointmentStatus
{
    Scheduled = 1,
    CheckedIn = 2,
    Completed = 3,
    Cancelled = 4,
    NoShow = 5
}

public enum RecordType
{
    LabResult = 1,
    Imaging = 2,
    Referral = 3,
    DischargeSummary = 4,
    Other = 99
}

public enum SummaryStatus
{
    Pending = 1,
    Processing = 2,
    Ready = 3,
    Failed = 4
}
