using Entites.DTOs.Common;
using Entites.DTOs.Teams;
using Entites.Models;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class TeamService : ITeamService
{
    private readonly UnitOfWork _unitOfWork;

    public TeamService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
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
