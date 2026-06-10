using Entites.DTOs.Common;
using Entites.DTOs.Teams;

namespace Services.Interfaces;

public interface ITeamService
{
    // Team CRUD
    Task<TeamDetailResponse> CreateTeamAsync(Guid userId, CreateTeamRequest request);
    Task<PagedResult<TeamResponse>> GetTeamsAsync(string? search, PaginationParams pagination);
    Task<TeamDetailResponse> GetTeamDetailAsync(Guid teamId);
    Task<TeamDetailResponse> UpdateTeamAsync(Guid userId, Guid teamId, UpdateTeamRequest request);
    Task DeleteTeamAsync(Guid userId, Guid teamId);

    // Members
    Task<List<TeamMemberResponse>> GetMembersAsync(Guid teamId);
    Task<TeamMemberResponse> UpdateMemberAsync(Guid currentUserId, Guid teamId, Guid targetUserId, UpdateMemberRequest request);
    Task RemoveMemberAsync(Guid currentUserId, Guid teamId, Guid targetUserId);

    // Invites
    Task<InviteInfoResponse> CreateInviteAsync(Guid userId, Guid teamId, CreateInviteRequest request);
    Task<InviteInfoResponse> GetInviteInfoAsync(string inviteToken);
    Task AcceptInviteAsync(Guid userId, string inviteToken);

    // Messages
    Task<TeamMessageResponse> SendTeamMessageAsync(Guid currentUserId, Guid teamId, CreateTeamMessageRequest request);
    Task<PagedResult<TeamMessageResponse>> GetTeamMessagesAsync(Guid teamId, string? search, PaginationParams pagination);
    Task RemoveTeamMessageAsync(Guid currentUserId, Guid messageId);
}
