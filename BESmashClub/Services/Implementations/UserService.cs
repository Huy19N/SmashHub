using System.Linq;
using Entites.DTOs.Users;
using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class UserService : IUserService
{
    private readonly UnitOfWork _unitOfWork;

    public UserService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<UserProfileResponse> GetProfileAsync(Guid userId)
    {
        var user = await _unitOfWork.Users.GetByIdWithRoleAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy user.");

        var sub = await _unitOfWork.UserSubscriptions.GetActiveSubscriptionAsync(userId);
        var tier = sub?.Plan?.Tier?.TierName ?? "Free";

        return MapToProfileResponse(user, tier);
    }

    public async Task<UserProfileResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdWithRoleAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy user.");

        if (!string.IsNullOrWhiteSpace(request.FullName))
            user.FullName = request.FullName;

        if (request.PhoneNumber != null)
            user.PhoneNumber = request.PhoneNumber;

        if (request.Cccd != null)
            user.Cccd = request.Cccd;

        await _unitOfWork.Users.UpdateAsync(user);

        var sub = await _unitOfWork.UserSubscriptions.GetActiveSubscriptionAsync(userId);
        var tier = sub?.Plan?.Tier?.TierName ?? "Free";

        return MapToProfileResponse(user, tier);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy user.");

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
            throw new InvalidOperationException("Mật khẩu hiện tại không đúng.");

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.LastPwdChange = DateTime.Now;

        await _unitOfWork.Users.UpdateAsync(user);
    }

    public async Task<UserPublicResponse> GetPublicProfileAsync(Guid userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy user.");

        var sportProfiles = await _unitOfWork.UserSportProfiles.GetByUserIdAsync(userId);
        var sportProfileDtos = sportProfiles.Select(profile => new Entites.DTOs.Sports.UserSportProfileResponse
        {
            SportId = profile.SportId,
            SportName = profile.SportLevel?.Sport?.SportName ?? "Unknown",
            RankValue = profile.SportLevel?.RankValue ?? 0,
            LevelName = profile.SportLevel?.LevelName ?? "Unknown",
            UpdatedAt = profile.UpdatedAt
        }).ToList();

        return new UserPublicResponse
        {
            UserId = user.UserId,
            FullName = user.FullName,
            CreatedAt = user.CreatedAt,
            AvatarFileId = user.AvatarFileId,
            SportProfiles = sportProfileDtos
        };
    }

    public async Task<UserProfileResponse> UpdateAvatarAsync(Guid userId, Guid fileId)
    {
        var user = await _unitOfWork.Users.GetByIdWithRoleAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy user.");

        user.AvatarFileId = fileId;
        await _unitOfWork.Users.UpdateAsync(user);

        var sub = await _unitOfWork.UserSubscriptions.GetActiveSubscriptionAsync(userId);
        var tier = sub?.Plan?.Tier?.TierName ?? "Free";

        return MapToProfileResponse(user, tier);
    }

    private static UserProfileResponse MapToProfileResponse(Entites.Models.User user, string? subscriptionTier)
    {
        return new UserProfileResponse
        {
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            RoleName = user.Role?.RoleName,
            CreatedAt = user.CreatedAt,
            IsActive = user.IsActive,
            AvatarFileId = user.AvatarFileId,
            Cccd = user.Cccd,
            SubscriptionTier = subscriptionTier
        };
    }

    public async Task BlockUserAsync(Guid blockerId, Guid blockedId)
    {
        if (blockerId == blockedId) throw new InvalidOperationException("Không thể tự chặn chính mình.");

        var existingBlock = await _unitOfWork.Context.UserBlocks
            .FirstOrDefaultAsync(b => b.BlockerId == blockerId && b.BlockedId == blockedId);
        
        if (existingBlock == null)
        {
            await _unitOfWork.Context.UserBlocks.AddAsync(new UserBlock
            {
                BlockerId = blockerId,
                BlockedId = blockedId,
                CreatedAt = DateTime.Now
            });
            await _unitOfWork.Context.SaveChangesAsync();
        }
    }

    public async Task UnblockUserAsync(Guid blockerId, Guid blockedId)
    {
        var existingBlock = await _unitOfWork.Context.UserBlocks
            .FirstOrDefaultAsync(b => b.BlockerId == blockerId && b.BlockedId == blockedId);

        if (existingBlock != null)
        {
            _unitOfWork.Context.UserBlocks.Remove(existingBlock);
            await _unitOfWork.Context.SaveChangesAsync();
        }
    }

    public async Task<List<UserPublicResponse>> GetBlockedUsersAsync(Guid userId)
    {
        var blockedUsers = await _unitOfWork.Context.UserBlocks
            .Where(b => b.BlockerId == userId)
            .Include(b => b.Blocked)
            .Select(b => new UserPublicResponse
            {
                UserId = b.Blocked.UserId,
                FullName = b.Blocked.FullName,
                CreatedAt = b.Blocked.CreatedAt,
                AvatarFileId = b.Blocked.AvatarFileId
            })
            .ToListAsync();

        return blockedUsers;
    }

    public async Task BanUserAsync(Guid userId, DateTime until, string reason)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null) throw new KeyNotFoundException("Người dùng không tồn tại.");

        user.BanUntil = until;
        user.BanReason = reason;
        await _unitOfWork.Users.UpdateAsync(user);
    }

    public async Task UnbanUserAsync(Guid userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null) throw new KeyNotFoundException("Người dùng không tồn tại.");

        user.BanUntil = null;
        user.BanReason = null;
        await _unitOfWork.Users.UpdateAsync(user);
    }
}
