using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Repositories;
using Entites.Models;
using Microsoft.EntityFrameworkCore;

namespace Services.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly UnitOfWork _unitOfWork;
        private static readonly ConcurrentDictionary<Guid, HashSet<string>> _onlineUsers = new();

        public ChatHub(UnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

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

        /// <summary>
        /// Gửi tín hiệu WebRTC (SDP offer/answer, ICE Candidates) cho peer cụ thể.
        /// </summary>
        public async Task SendSignal(string targetConnectionId, string signalData)
        {
            await Clients.Client(targetConnectionId).SendAsync("ReceiveSignal", Context.ConnectionId, signalData);
        }

        /// <summary>
        /// Bắt đầu cuộc gọi video nhóm.
        /// </summary>
        public async Task StartCall(Guid teamId, string roomId)
        {
            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                // Thêm người gọi vào group video call
                await Groups.AddToGroupAsync(Context.ConnectionId, $"webrtc_room_{roomId}");
                
                // Broadcast cho cả team biết có cuộc gọi bắt đầu
                await Clients.Group(teamId.ToString()).SendAsync("CallStarted", roomId, userId, Context.ConnectionId);
            }
        }

        /// <summary>
        /// Tham gia cuộc gọi video đang diễn ra.
        /// </summary>
        public async Task JoinCall(string roomId)
        {
            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"webrtc_room_{roomId}");
                // Thông báo cho các thành viên khác trong phòng cuộc gọi
                await Clients.GroupExcept($"webrtc_room_{roomId}", Context.ConnectionId).SendAsync("UserJoinedCall", Context.ConnectionId, userId);
            }
        }

        /// <summary>
        /// Rời cuộc gọi video.
        /// </summary>
        public async Task LeaveCall(string roomId)
        {
            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"webrtc_room_{roomId}");
                // Thông báo cho các thành viên khác
                await Clients.GroupExcept($"webrtc_room_{roomId}", Context.ConnectionId).SendAsync("UserLeftCall", Context.ConnectionId, userId);
            }
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"Client connected: {Context.ConnectionId} | User: {Context.UserIdentifier}");
            
            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                var userConnections = _onlineUsers.GetOrAdd(userId, _ => new HashSet<string>());
                lock (userConnections)
                {
                    userConnections.Add(Context.ConnectionId);
                }

                if (userConnections.Count == 1)
                {
                    // Lấy các team mà user tham gia để broadcast
                    var context = _unitOfWork.TeamMembers.GetContext();
                    var teamIds = await context.Set<TeamMember>()
                        .Where(tm => tm.UserId == userId)
                        .Select(tm => tm.TeamId)
                        .ToListAsync();

                    foreach (var teamId in teamIds)
                      {
                          await Clients.Group(teamId.ToString()).SendAsync("UserOnline", userId);
                      }
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");

            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                if (_onlineUsers.TryGetValue(userId, out var userConnections))
                {
                    lock (userConnections)
                    {
                        userConnections.Remove(Context.ConnectionId);
                    }

                    if (userConnections.Count == 0)
                    {
                        _onlineUsers.TryRemove(userId, out _);

                        // Lấy các team mà user tham gia để broadcast
                        var context = _unitOfWork.TeamMembers.GetContext();
                        var teamIds = await context.Set<TeamMember>()
                            .Where(tm => tm.UserId == userId)
                            .Select(tm => tm.TeamId)
                            .ToListAsync();

                        foreach (var teamId in teamIds)
                        {
                            await Clients.Group(teamId.ToString()).SendAsync("UserOffline", userId);
                        }
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// API kiểm tra trạng thái online/offline của một user cụ thể.
        /// </summary>
        public static bool IsUserOnline(Guid userId)
        {
            return _onlineUsers.TryGetValue(userId, out var conns) && conns.Count > 0;
        }
    }
}
