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
            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                await Clients.Client(targetConnectionId).SendAsync("ReceiveSignal", Context.ConnectionId, userId, signalData);
            }
            else
            {
                await Clients.Client(targetConnectionId).SendAsync("ReceiveSignal", Context.ConnectionId, Guid.Empty, signalData);
            }
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

                if (Guid.TryParse(roomId, out var sessionId))
                {
                    var context = _unitOfWork.TeamMembers.GetContext();
                    var session = new VideoCallSession
                    {
                        SessionId = sessionId,
                        TeamId = teamId,
                        InitiatedByUserId = userId,
                        StartedAt = DateTime.Now
                    };
                    context.Set<VideoCallSession>().Add(session);
                    
                    var participant = new VideoCallParticipant
                    {
                        SessionId = sessionId,
                        UserId = userId,
                        JoinedAt = DateTime.Now
                    };
                    context.Set<VideoCallParticipant>().Add(participant);
                    
                    var callMessage = new TeamMessage
                    {
                        MessageId = Guid.NewGuid(),
                        TeamId = teamId,
                        SenderId = userId,
                        MessageType = 4,
                        Content = $"ROOM_ID:{roomId}",
                        SentAt = DateTime.Now,
                        IsDeleted = false
                    };
                    context.Set<TeamMessage>().Add(callMessage);

                    await context.SaveChangesAsync();
                }
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

                if (Guid.TryParse(roomId, out var sessionId))
                {
                    var context = _unitOfWork.TeamMembers.GetContext();
                    var participant = await context.Set<VideoCallParticipant>()
                        .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.UserId == userId);

                    if (participant == null)
                    {
                        context.Set<VideoCallParticipant>().Add(new VideoCallParticipant
                        {
                            SessionId = sessionId,
                            UserId = userId,
                            JoinedAt = DateTime.Now
                        });
                    }
                    else if (participant.LeftAt != null)
                    {
                        participant.LeftAt = null;
                        participant.JoinedAt = DateTime.Now;
                        context.Set<VideoCallParticipant>().Update(participant);
                    }
                    await context.SaveChangesAsync();
                }
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

                if (Guid.TryParse(roomId, out var sessionId))
                {
                    var context = _unitOfWork.TeamMembers.GetContext();
                    var participant = await context.Set<VideoCallParticipant>()
                        .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.UserId == userId && p.LeftAt == null);
                    
                    if (participant != null)
                    {
                        participant.LeftAt = DateTime.Now;
                        context.Set<VideoCallParticipant>().Update(participant);
                    }

                    // Nếu là người tạo phòng rời đi, đóng luôn session
                    var session = await context.Set<VideoCallSession>().FirstOrDefaultAsync(s => s.SessionId == sessionId);
                    if (session != null && session.InitiatedByUserId == userId && session.EndedAt == null)
                    {
                        session.EndedAt = DateTime.Now;
                        context.Set<VideoCallSession>().Update(session);

                        await Clients.Group(session.TeamId.ToString()).SendAsync("CallEnded", roomId);
                    }

                    await context.SaveChangesAsync();
                }
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

                var context = _unitOfWork.TeamMembers.GetContext();
                var teamIds = await context.Set<TeamMember>()
                    .Where(tm => tm.UserId == userId)
                    .Select(tm => tm.TeamId)
                    .ToListAsync();

                foreach (var teamId in teamIds)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, teamId.ToString());
                }

                if (userConnections.Count == 1)
                {
                    // Lấy các team mà user tham gia để broadcast
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
