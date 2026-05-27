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
            ProfileId = Guid.NewGuid(),
            UserId = userId,
            SportId = request.SportId,
            LevelId = request.LevelId,
            UpdatedAt = DateTime.Now
        };

        await _unitOfWork.UserSportProfiles.CreateAsync(profile);

        var created = await _unitOfWork.UserSportProfiles.GetByIdWithDetailsAsync(profile.ProfileId);
        return MapToResponse(created!);
    }

    public async Task<UserSportProfileResponse> UpdateAsync(Guid userId, Guid profileId, UpdateSportProfileRequest request)
    {
        var profile = await _unitOfWork.UserSportProfiles.GetByIdWithDetailsAsync(profileId);
        if (profile == null || profile.UserId != userId)
            throw new KeyNotFoundException("Không tìm thấy sport profile.");

        profile.LevelId = request.LevelId;
        profile.UpdatedAt = DateTime.Now;

        await _unitOfWork.UserSportProfiles.UpdateAsync(profile);

        var updated = await _unitOfWork.UserSportProfiles.GetByIdWithDetailsAsync(profileId);
        return MapToResponse(updated!);
    }

    public async Task DeleteAsync(Guid userId, Guid profileId)
    {
        var profile = await _unitOfWork.UserSportProfiles.GetByIdAsync(profileId);
        if (profile == null || profile.UserId != userId)
            throw new KeyNotFoundException("Không tìm thấy sport profile.");

        await _unitOfWork.UserSportProfiles.RemoveAsync(profile);
    }

    private static UserSportProfileResponse MapToResponse(UserSportProfile profile)
    {
        return new UserSportProfileResponse
        {
            ProfileId = profile.ProfileId,
            SportId = profile.SportId,
            SportName = profile.Sport?.SportName,
            LevelId = profile.LevelId,
            LevelName = profile.Level?.LevelName,
            UpdatedAt = profile.UpdatedAt
        };
    }
}
