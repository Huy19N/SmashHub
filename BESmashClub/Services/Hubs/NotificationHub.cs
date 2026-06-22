using Microsoft.AspNetCore.SignalR;

namespace Services.Hubs;

public class NotificationHub : Hub
{
    // Clients can connect and listen to "ReceiveNotification"
    // We map Context.UserIdentifier if authenticated
    public override Task OnConnectedAsync()
    {
        return base.OnConnectedAsync();
    }
}
