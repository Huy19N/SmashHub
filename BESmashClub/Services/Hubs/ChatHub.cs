using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Services.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        /// <summary>
        /// Tham gia group chat của team để nhận tin nhắn realtime.
        /// </summary>
        public async Task JoinTeamChat(Guid teamId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, teamId.ToString());
            await Clients.Caller.SendAsync("JoinedTeam", teamId);
        }

        /// <summary>
        /// Rời group chat của team.
        /// </summary>
        public async Task LeaveTeamChat(Guid teamId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, teamId.ToString());
            await Clients.Caller.SendAsync("LeftTeam", teamId);
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"Client connected: {Context.ConnectionId} | User: {Context.UserIdentifier}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}
