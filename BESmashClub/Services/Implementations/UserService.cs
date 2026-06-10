using Entites.DTOs.Users;
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

        return MapToProfileResponse(user);
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

        await _unitOfWork.Users.UpdateAsync(user);

        return MapToProfileResponse(user);
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

        return new UserPublicResponse
        {
            UserId = user.UserId,
            FullName = user.FullName,
            CreatedAt = user.CreatedAt,
            AvatarFileId = user.AvatarFileId
        };
    }

    public async Task<UserProfileResponse> UpdateAvatarAsync(Guid userId, Guid fileId)
    {
        var user = await _unitOfWork.Users.GetByIdWithRoleAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy user.");

        user.AvatarFileId = fileId;
        await _unitOfWork.Users.UpdateAsync(user);

        return MapToProfileResponse(user);
    }

    private static UserProfileResponse MapToProfileResponse(Entites.Models.User user)
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
            AvatarFileId = user.AvatarFileId
        };
    }
}
