using Entites.DTOs.Sports;

namespace Services.Interfaces;

public interface IUserSportProfileService
{
    Task<List<UserSportProfileResponse>> GetByUserIdAsync(Guid userId);
    Task<UserSportProfileResponse> CreateAsync(Guid userId, CreateSportProfileRequest request);
    Task<UserSportProfileResponse> UpdateAsync(Guid userId, int sportId, UpdateSportProfileRequest request);
    Task DeleteAsync(Guid userId, int sportId);

}
