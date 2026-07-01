using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Services.Hubs;

public class PresenceHub : Hub
{
    public override Task OnConnectedAsync()
    {
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(System.Exception? exception)
    {
        return base.OnDisconnectedAsync(exception);
    }
}
