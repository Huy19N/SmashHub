using Entites.DTOs.Users;

namespace Services.Interfaces;

public interface IUserService
{
    Task<UserProfileResponse> GetProfileAsync(Guid userId);
    Task<UserProfileResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    Task<UserPublicResponse> GetPublicProfileAsync(Guid userId);
    Task<UserProfileResponse> UpdateAvatarAsync(Guid userId, Guid fileId);
}
