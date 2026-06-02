using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Sports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[Authorize]
[ApiController]
[Route("api/users/me/sport-profiles")]
public class UserSportProfilesController : ControllerBase
{
    private readonly IUserSportProfileService _service;

    public UserSportProfilesController(IUserSportProfileService service)
    {
        _service = service;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Lấy danh sách trình độ các môn của user đang đăng nhập.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyProfiles()
    {
        var result = await _service.GetByUserIdAsync(GetCurrentUserId());
        return Ok(ApiResponse<List<UserSportProfileResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Khai báo trình độ cho một môn mới.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateProfile([FromBody] CreateSportProfileRequest request)
    {
        try
        {
            var result = await _service.CreateAsync(GetCurrentUserId(), request);
            return CreatedAtAction(nameof(GetMyProfiles), null, 
                ApiResponse<UserSportProfileResponse>.SuccessResponse(result, "Khai báo trình độ thành công."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Cập nhật trình độ (ví dụ: từ Cơ bản lên Tuyển thủ).
    /// </summary>
    [HttpPut("{sportId:int}")]
    public async Task<IActionResult> UpdateProfile(int sportId, [FromBody] UpdateSportProfileRequest request)
    {
        try
        {
            var result = await _service.UpdateAsync(GetCurrentUserId(), sportId, request);
            return Ok(ApiResponse<UserSportProfileResponse>.SuccessResponse(result, "Cập nhật trình độ thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Xóa profile của một môn.
    /// </summary>
    [HttpDelete("{sportId:int}")]
    public async Task<IActionResult> DeleteProfile(int sportId)
    {
        try
        {
            await _service.DeleteAsync(GetCurrentUserId(), sportId);
            return Ok(ApiResponse.SuccessResponse("Xóa sport profile thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }
}
