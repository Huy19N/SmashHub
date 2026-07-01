using Entites.DTOs.Users;

namespace Services.Interfaces;

public interface IUserService
{
    Task<UserProfileResponse> GetProfileAsync(Guid userId);
    Task<UserProfileResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    Task<UserPublicResponse> GetPublicProfileAsync(Guid userId);
    Task<UserProfileResponse> UpdateAvatarAsync(Guid userId, Guid fileId);
    
    // User Moderation
    Task BlockUserAsync(Guid blockerId, Guid blockedId);
    Task UnblockUserAsync(Guid blockerId, Guid blockedId);
    
    // Admin features
    Task BanUserAsync(Guid userId, DateTime until, string reason);
    Task UnbanUserAsync(Guid userId);
}
