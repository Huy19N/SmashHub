using Microsoft.AspNetCore.SignalR;

namespace Services.Hubs
{
    public class ChatHub : Hub
    {
        public async Task ListenToTeam(Guid teamId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, teamId.ToString());
        }

        public async Task LeaveTeam(Guid teamId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, teamId.ToString());
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}
