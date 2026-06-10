using Entites.DTOs.Common;
using Entites.DTOs.Teams;
using Entites.Models;
using Microsoft.AspNetCore.SignalR;
using Repositories;
using Services.Hubs;
using Services.Interfaces;

namespace Services.Implementations;

public class TeamService : ITeamService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly IHubContext<ChatHub> _hubContext;

    public TeamService(UnitOfWork unitOfWork, IHubContext<ChatHub> hubContext)
    {
        _unitOfWork = unitOfWork;
        _hubContext = hubContext;
    }

    #region Team CRUD

    public async Task<TeamDetailResponse> CreateTeamAsync(Guid userId, CreateTeamRequest request)
    {
        var team = new Team
        {
            TeamId = Guid.NewGuid(),
            TeamName = request.TeamName,
            Description = request.Description,
            CreatedAt = DateTime.Now,
            IsActive = true
        };

        await _unitOfWork.Teams.CreateAsync(team);

        // Add creator as Leader (TeamRoleId = 1)
        var member = new TeamMember
        {
            TeamId = team.TeamId,
            UserId = userId,
            TeamRoleId = 1, // Leader
            Wins = 0,
            Losses = 0,
            JoinedAt = DateTime.Now
        };

        await _unitOfWork.TeamMembers.CreateAsync(member);

        return await GetTeamDetailAsync(team.TeamId);
    }

    public async Task<PagedResult<TeamResponse>> GetTeamsAsync(string? search, PaginationParams pagination)
    {
        var (items, totalCount) = await _unitOfWork.Teams.SearchAsync(
            search, pagination.PageNumber, pagination.PageSize);

        return new PagedResult<TeamResponse>
        {
            Items = items.Select(t => new TeamResponse
            {
                TeamId = t.TeamId,
                TeamName = t.TeamName,
                Description = t.Description,
                CreatedAt = t.CreatedAt,
                IsActive = t.IsActive,
                MemberCount = t.TeamMembers?.Count ?? 0
            }).ToList(),
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task<TeamDetailResponse> GetTeamDetailAsync(Guid teamId)
    {
        var team = await _unitOfWork.Teams.GetDetailAsync(teamId);
        if (team == null)
            throw new KeyNotFoundException("Không tìm thấy team.");

        return MapToDetailResponse(team);
    }

    public async Task<TeamDetailResponse> UpdateTeamAsync(Guid userId, Guid teamId, UpdateTeamRequest request)
    {
        await EnsureLeaderAsync(teamId, userId);

        var team = await _unitOfWork.Teams.GetByIdAsync(teamId);
        if (team == null)
            throw new KeyNotFoundException("Không tìm thấy team.");

        if (!string.IsNullOrWhiteSpace(request.TeamName))
            team.TeamName = request.TeamName;

        if (request.Description != null)
            team.Description = request.Description;

        await _unitOfWork.Teams.UpdateAsync(team);

        return await GetTeamDetailAsync(teamId);
    }

    public async Task DeleteTeamAsync(Guid userId, Guid teamId)
    {
        await EnsureLeaderAsync(teamId, userId);

        var team = await _unitOfWork.Teams.GetByIdAsync(teamId);
        if (team == null)
            throw new KeyNotFoundException("Không tìm thấy team.");

        // Soft delete
        team.IsActive = false;
        await _unitOfWork.Teams.UpdateAsync(team);
    }

    #endregion

    #region Members

    public async Task<List<TeamMemberResponse>> GetMembersAsync(Guid teamId)
    {
        var members = await _unitOfWork.TeamMembers.GetByTeamIdAsync(teamId);
        return members.Select(MapToMemberResponse).ToList();
    }

    public async Task<TeamMemberResponse> UpdateMemberAsync(
        Guid currentUserId, Guid teamId, Guid targetUserId, UpdateMemberRequest request)
    {
        await EnsureLeaderAsync(teamId, currentUserId);

        var member = await _unitOfWork.TeamMembers.GetMemberAsync(teamId, targetUserId);
        if (member == null)
            throw new KeyNotFoundException("Không tìm thấy thành viên.");

        if (request.TeamRoleId.HasValue)
            member.TeamRoleId = request.TeamRoleId.Value;

        if (request.Wins.HasValue)
            member.Wins = request.Wins.Value;

        if (request.Losses.HasValue)
            member.Losses = request.Losses.Value;

        await _unitOfWork.TeamMembers.UpdateAsync(member);

        // Reload with includes
        var updated = await _unitOfWork.TeamMembers.GetMemberAsync(teamId, targetUserId);
        return MapToMemberResponse(updated!);
    }

    public async Task RemoveMemberAsync(Guid currentUserId, Guid teamId, Guid targetUserId)
    {
        // If removing yourself, just leave
        if (currentUserId != targetUserId)
        {
            // Only leader can kick others
            await EnsureLeaderAsync(teamId, currentUserId);
        }

        var member = await _unitOfWork.TeamMembers.GetMemberAsync(teamId, targetUserId);
        if (member == null)
            throw new KeyNotFoundException("Không tìm thấy thành viên.");

        // Leader cannot remove themselves (must delete team instead)
        if (member.TeamRoleId == 1 && currentUserId == targetUserId)
            throw new InvalidOperationException("Leader không thể rời nhóm. Hãy giải tán hoặc chuyển quyền leader.");

        await _unitOfWork.TeamMembers.RemoveAsync(member);
    }

    #endregion

    #region Invites

    public async Task<InviteInfoResponse> CreateInviteAsync(Guid userId, Guid teamId, CreateInviteRequest request)
    {
        await EnsureLeaderAsync(teamId, userId);

        var team = await _unitOfWork.Teams.GetByIdAsync(teamId);
        if (team == null)
            throw new KeyNotFoundException("Không tìm thấy team.");

        var invite = new TeamInvite
        {
            InviteId = Guid.NewGuid(),
            TeamId = teamId,
            CreatedByUserId = userId,
            InviteToken = Guid.NewGuid().ToString("N"),
            CreatedAt = DateTime.Now,
            ExpiredAt = DateTime.Now.AddHours(request.ExpirationHours),
            MaxUses = request.MaxUses,
            CurrentUses = 0,
            IsActive = true
        };

        await _unitOfWork.TeamInvites.CreateAsync(invite);

        return await GetInviteInfoAsync(invite.InviteToken);
    }

    public async Task<InviteInfoResponse> GetInviteInfoAsync(string inviteToken)
    {
        var invite = await _unitOfWork.TeamInvites.GetByTokenAsync(inviteToken);
        if (invite == null)
            throw new KeyNotFoundException("Không tìm thấy lời mời.");

        var isValid = invite.IsActive == true
            && invite.ExpiredAt > DateTime.Now
            && (invite.MaxUses == null || invite.CurrentUses < invite.MaxUses);

        return new InviteInfoResponse
        {
            InviteToken = invite.InviteToken,
            TeamId = invite.TeamId,
            TeamName = invite.Team?.TeamName,
            CreatedByUserName = invite.CreatedByUser?.FullName,
            CreatedAt = invite.CreatedAt,
            ExpiredAt = invite.ExpiredAt,
            MaxUses = invite.MaxUses,
            CurrentUses = invite.CurrentUses,
            IsValid = isValid
        };
    }

    public async Task AcceptInviteAsync(Guid userId, string inviteToken)
    {
        var invite = await _unitOfWork.TeamInvites.GetByTokenAsync(inviteToken);
        if (invite == null)
            throw new KeyNotFoundException("Không tìm thấy lời mời.");

        if (invite.IsActive != true || invite.ExpiredAt < DateTime.Now)
            throw new InvalidOperationException("Lời mời đã hết hạn hoặc bị vô hiệu hóa.");

        if (invite.MaxUses != null && invite.CurrentUses >= invite.MaxUses)
            throw new InvalidOperationException("Lời mời đã đạt giới hạn sử dụng.");

        // Check if already a member
        if (await _unitOfWork.TeamMembers.IsMemberAsync(invite.TeamId, userId))
            throw new InvalidOperationException("Bạn đã là thành viên của nhóm này.");

        // Add as Member (TeamRoleId = 2)
        var member = new TeamMember
        {
            TeamId = invite.TeamId,
            UserId = userId,
            TeamRoleId = 2, // Member
            Wins = 0,
            Losses = 0,
            JoinedAt = DateTime.Now
        };

        await _unitOfWork.TeamMembers.CreateAsync(member);

        // Increment usage count
        invite.CurrentUses = (invite.CurrentUses ?? 0) + 1;
        await _unitOfWork.TeamInvites.UpdateAsync(invite);
    }

    #endregion

    #region Messages

    public async Task<TeamMessageResponse> SendTeamMessageAsync(Guid currentUserId, Guid teamId, CreateTeamMessageRequest request)
    {
        if (!await _unitOfWork.TeamMembers.IsMemberAsync(teamId, currentUserId))
            throw new InvalidOperationException("Bạn không phải là thành viên của nhóm này.");

        var message = new TeamMessage
        {
            MessageId = Guid.NewGuid(),
            SenderId = currentUserId,
            TeamId = teamId,
            Content = request.Content,
            MessageType = request.MessageType,
            MediaFileId = request.MediaFileId,
            SentAt = DateTime.Now,
            IsDeleted = false
        };

        await _unitOfWork.TeamMessages.CreateAsync(message);

        // Reload with Sender included
        var created = await _unitOfWork.TeamMessages.GetMessageWithSenderAsync(message.MessageId);

        var response = new TeamMessageResponse
        {
            MessageId = created!.MessageId,
            TeamId = created.TeamId,
            SenderId = created.SenderId,
            SenderName = created.Sender?.FullName,
            Content = created.Content,
            MessageType = created.MessageType,
            MediaFileId = created.MediaFileId,
            MediaUrl = created.MediaFileId.HasValue ? $"/api/files/{created.MediaFileId.Value}" : null,
            SentAt = created.SentAt
        };

        // Broadcast to the team group via SignalR
        await _hubContext.Clients.Group(teamId.ToString())
            .SendAsync("ReceiveTeamMessage", response);

        return response;
    }

    public async Task<PagedResult<TeamMessageResponse>> GetTeamMessagesAsync(
        Guid teamId, string? search, PaginationParams pagination)
    {
        var (items, totalCount) = await _unitOfWork.TeamMessages
            .GetMessagesByTeamIdAsync(teamId, search, pagination.PageNumber, pagination.PageSize);

        return new PagedResult<TeamMessageResponse>
        {
            Items = items.Select(m => new TeamMessageResponse
            {
                MessageId = m.MessageId,
                TeamId = m.TeamId,
                SenderId = m.SenderId,
                SenderName = m.Sender?.FullName,
                Content = m.Content,
                MessageType = m.MessageType,
                MediaFileId = m.MediaFileId,
                MediaUrl = m.MediaFileId.HasValue ? $"/api/files/{m.MediaFileId.Value}" : null,
                SentAt = m.SentAt
            }).ToList(),
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task RemoveTeamMessageAsync(Guid currentUserId, Guid messageId)
    {
        var message = await _unitOfWork.TeamMessages.GetMessageWithSenderAsync(messageId);
        if (message == null)
            throw new KeyNotFoundException("Không tìm thấy tin nhắn.");

        // Only the sender or team leader can delete
        var isLeader = await _unitOfWork.TeamMembers.IsLeaderAsync(message.TeamId, currentUserId);
        if (message.SenderId != currentUserId && !isLeader)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa tin nhắn này.");

        // Soft delete
        message.IsDeleted = true;
        await _unitOfWork.TeamMessages.UpdateAsync(message);

        // Notify group about deletion
        await _hubContext.Clients.Group(message.TeamId.ToString())
            .SendAsync("MessageDeleted", messageId);
    }

    #endregion

    #region Helpers

    private async Task EnsureLeaderAsync(Guid teamId, Guid userId)
    {
        if (!await _unitOfWork.TeamMembers.IsLeaderAsync(teamId, userId))
            throw new UnauthorizedAccessException("Chỉ Leader mới có quyền thực hiện thao tác này.");
    }

    private static TeamDetailResponse MapToDetailResponse(Team team)
    {
        return new TeamDetailResponse
        {
            TeamId = team.TeamId,
            TeamName = team.TeamName,
            Description = team.Description,
            CreatedAt = team.CreatedAt,
            IsActive = team.IsActive,
            Members = team.TeamMembers?.Select(MapToMemberResponse).ToList() ?? new()
        };
    }

    private static TeamMemberResponse MapToMemberResponse(TeamMember tm)
    {
        return new TeamMemberResponse
        {
            UserId = tm.UserId,
            FullName = tm.User?.FullName,
            RoleName = tm.TeamRole?.RoleName,
            Wins = tm.Wins,
            Losses = tm.Losses,
            JoinedAt = tm.JoinedAt
        };
    }

    #endregion
}
