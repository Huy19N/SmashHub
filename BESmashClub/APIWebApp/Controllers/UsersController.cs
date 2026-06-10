using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Lấy thông tin profile của user đang đăng nhập.
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        try
        {
            var result = await _userService.GetProfileAsync(GetCurrentUserId());
            return Ok(ApiResponse<UserProfileResponse>.SuccessResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Cập nhật thông tin cá nhân.
    /// </summary>
    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var result = await _userService.UpdateProfileAsync(GetCurrentUserId(), request);
            return Ok(ApiResponse<UserProfileResponse>.SuccessResponse(result, "Cập nhật thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Đổi mật khẩu.
    /// </summary>
    [Authorize]
    [HttpPatch("me/password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            await _userService.ChangePasswordAsync(GetCurrentUserId(), request);
            return Ok(ApiResponse.SuccessResponse("Đổi mật khẩu thành công."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Lấy thông tin public của một user khác.
    /// </summary>
    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetPublicProfile(Guid userId)
    {
        try
        {
            var result = await _userService.GetPublicProfileAsync(userId);
            return Ok(ApiResponse<UserPublicResponse>.SuccessResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Cập nhật ảnh đại diện (Avatar).
    /// </summary>
    [Authorize]
    [HttpPost("me/avatar")]
    public async Task<IActionResult> UpdateAvatar(IFormFile file, [FromServices] IFileService fileService)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse.ErrorResponse("Tệp tải lên không hợp lệ hoặc rỗng."));

        if (!file.ContentType.StartsWith("image/"))
            return BadRequest(ApiResponse.ErrorResponse("Vui lòng tải lên tệp hình ảnh hợp lệ."));

        try
        {
            var userId = GetCurrentUserId();
            var fileName = file.FileName;
            var mimeType = file.ContentType;

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileData = ms.ToArray();

            // Save file in LocalFiles table with purpose 'Avatar' and type 'Image'
            var fileId = await fileService.UploadFileAsync(userId, fileName, fileData, "Image", "Avatar", mimeType);

            // Update user profile
            var profile = await _userService.UpdateAvatarAsync(userId, fileId);

            return Ok(ApiResponse<UserProfileResponse>.SuccessResponse(profile, "Cập nhật ảnh đại diện thành công."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Kiểm tra trạng thái online/offline của một user cụ thể (public).
    /// </summary>
    [HttpGet("{userId:guid}/online")]
    public IActionResult CheckUserOnline(Guid userId)
    {
        var isOnline = Services.Hubs.ChatHub.IsUserOnline(userId);
        return Ok(ApiResponse<object>.SuccessResponse(new { UserId = userId, IsOnline = isOnline }));
    }
}
