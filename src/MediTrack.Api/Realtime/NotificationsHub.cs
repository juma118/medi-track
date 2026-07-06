using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MediTrack.Api.Realtime;

[Authorize]
public class NotificationsHub : Hub
{
    public Task SubscribeToPatient(string patientId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, PatientGroup(patientId));

    public Task UnsubscribeFromPatient(string patientId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, PatientGroup(patientId));

    public static string PatientGroup(string patientId) => $"patient:{patientId}";
}
