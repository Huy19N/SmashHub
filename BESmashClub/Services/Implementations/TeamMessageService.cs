using Microsoft.AspNetCore.SignalR;
using Repositories;
using Services.Hubs;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Implementations
{
    public class TeamMessageService : ITeamMessageService
    {
        private readonly UnitOfWork _unitOfWork;
        private readonly IHubContext<ChatHub> _hubContext;
        public TeamMessageService(UnitOfWork unitOfWork, IHubContext<ChatHub> hubContext)
        {
            _unitOfWork = unitOfWork;
            _hubContext = hubContext;
        }

        public async Task<ChatResult> SendMessageToGroupAsync(Guid teamId, Guid senderId, string content)
        {
            // 1. KIỂM TRA BẢO MẬT: User gửi tin có nằm trong nhóm này không?
            bool isMember = await _teamRepository.IsUserInTeamAsync(teamId, senderId);
            if (!isMember)
            {
                return ChatResult.Fail("Bạn không phải là thành viên của nhóm này.");
            }

            // 2. Lưu tin nhắn vào Database
            var message = new Message
            {
                Id = Guid.NewGuid(),
                TeamId = teamId,
                SenderId = senderId,
                Content = content,
                CreatedAt = DateTime.UtcNow
            };
            await _messageRepository.AddAsync(message);

            // 3. BẮN TIN NHẮN CHO THÀNH VIÊN TRONG NHÓM THÔI
            // Chuyển teamId thành chuỗi để làm tên Group trong SignalR
            string groupName = teamId.ToString();

            await _hubContext.Clients.Group(groupName)
                .SendAsync("ReceiveGroupMessage", new
                {
                    MessageId = message.Id,
                    TeamId = message.TeamId,
                    SenderId = message.SenderId,
                    Content = message.Content,
                    CreatedAt = message.CreatedAt
                });

            return ChatResult.Success(message);
        }

    }
}
