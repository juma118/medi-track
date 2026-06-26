using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MediTrack.Api.Realtime;

/// <summary>
/// Real-time channel for pushing events to clients (e.g. "AI summary ready").
/// Backed by a Redis backplane so it fans out across all API replicas.
/// </summary>
[Authorize]
public class NotificationsHub : Hub
{
    // Clients can subscribe to a specific patient's updates.
    public Task SubscribeToPatient(string patientId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, PatientGroup(patientId));

    public Task UnsubscribeFromPatient(string patientId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, PatientGroup(patientId));

    public static string PatientGroup(string patientId) => $"patient:{patientId}";
}
