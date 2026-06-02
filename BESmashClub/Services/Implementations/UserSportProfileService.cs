using Entites.DTOs.Sports;
using Entites.Models;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class UserSportProfileService : IUserSportProfileService
{
    private readonly UnitOfWork _unitOfWork;

    public UserSportProfileService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<UserSportProfileResponse>> GetByUserIdAsync(Guid userId)
    {
        var profiles = await _unitOfWork.UserSportProfiles.GetByUserIdAsync(userId);
        return profiles.Select(MapToResponse).ToList();
    }

    public async Task<UserSportProfileResponse> CreateAsync(Guid userId, CreateSportProfileRequest request)
    {
        // Check if user already has a profile for this sport
        var existing = await _unitOfWork.UserSportProfiles.GetByUserAndSportAsync(userId, request.SportId);
        if (existing != null)
            throw new InvalidOperationException("Bạn đã khai báo trình độ cho môn thể thao này.");

        var profile = new UserSportProfile
        {
            UserId = userId,
            SportId = request.SportId,
            RankValue = request.RankValue,
            UpdatedAt = DateTime.Now
        };

        await _unitOfWork.UserSportProfiles.CreateAsync(profile);

        var created = await _unitOfWork.UserSportProfiles.GetWithDetailsAsync(userId, request.SportId);
        return MapToResponse(created!);
    }

    public async Task<UserSportProfileResponse> UpdateAsync(Guid userId, int sportId, UpdateSportProfileRequest request)
    {
        var profile = await _unitOfWork.UserSportProfiles.GetByUserAndSportAsync(userId, sportId);
        if (profile == null)
            throw new KeyNotFoundException("Không tìm thấy sport profile.");

        // Soft-delete old record and create new one with updated RankValue
        // (Theo yêu cầu: đánh dấu cũ false, thêm mới thay thế)
        profile.RankValue = request.RankValue;
        profile.UpdatedAt = DateTime.Now;

        await _unitOfWork.UserSportProfiles.UpdateAsync(profile);

        var updated = await _unitOfWork.UserSportProfiles.GetWithDetailsAsync(userId, sportId);
        return MapToResponse(updated!);
    }

    public async Task DeleteAsync(Guid userId, int sportId)
    {
        var profile = await _unitOfWork.UserSportProfiles.GetByUserAndSportAsync(userId, sportId);
        if (profile == null)
            throw new KeyNotFoundException("Không tìm thấy sport profile.");

        await _unitOfWork.UserSportProfiles.RemoveAsync(profile);
    }

    private static UserSportProfileResponse MapToResponse(UserSportProfile profile)
    {
        return new UserSportProfileResponse
        {
            SportId = profile.SportId,
            SportName = profile.SportLevel?.Sport?.SportName,
            RankValue = profile.RankValue,
            LevelName = profile.SportLevel?.LevelName,
            UpdatedAt = profile.UpdatedAt
        };
    }
}
