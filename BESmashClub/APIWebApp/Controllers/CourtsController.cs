using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Courts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
[Authorize]
public class CourtsController : ControllerBase
{
    private readonly ICourtService _courtService;

    public CourtsController(ICourtService courtService)
    {
        _courtService = courtService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Tạo sân mới trong cơ sở.
    /// </summary>
    [HttpPost("api/facilities/{facilityId:int}/courts")]
    public async Task<IActionResult> CreateCourt(int facilityId, [FromBody] CreateCourtRequest request)
    {
        try
        {
            request.FacilityId = facilityId;
            var userId = GetCurrentUserId();
            var result = await _courtService.CreateCourtAsync(userId, request);
            return Ok(ApiResponse<CourtResponse>.SuccessResponse(result, "Tạo sân thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Lấy danh sách sân theo cơ sở (public).
    /// </summary>
    [HttpGet("api/facilities/{facilityId:int}/courts")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCourtsByFacility(int facilityId)
    {
        var result = await _courtService.GetCourtsByFacilityAsync(facilityId);
        return Ok(ApiResponse<List<CourtResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Lấy chi tiết sân.
    /// </summary>
    [HttpGet("api/courts/{courtId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCourtDetail(int courtId)
    {
        try
        {
            var result = await _courtService.GetCourtDetailAsync(courtId);
            return Ok(ApiResponse<CourtResponse>.SuccessResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Cập nhật thông tin sân (chỉ chủ sở hữu cơ sở).
    /// </summary>
    [HttpPut("api/courts/{courtId:int}")]
    public async Task<IActionResult> UpdateCourt(int courtId, [FromBody] UpdateCourtRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _courtService.UpdateCourtAsync(userId, courtId, request);
            return Ok(ApiResponse<CourtResponse>.SuccessResponse(result, "Cập nhật sân thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Xóa sân (chỉ chủ sở hữu cơ sở).
    /// </summary>
    [HttpDelete("api/courts/{courtId:int}")]
    public async Task<IActionResult> DeleteCourt(int courtId)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _courtService.DeleteCourtAsync(userId, courtId);
            return Ok(ApiResponse.SuccessResponse("Xóa sân thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
