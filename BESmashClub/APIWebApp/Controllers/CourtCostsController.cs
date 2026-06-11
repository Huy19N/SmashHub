using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.CourtCosts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
[Authorize]
public class CourtCostsController : ControllerBase
{
    private readonly ICourtCostService _courtCostService;

    public CourtCostsController(ICourtCostService courtCostService)
    {
        _courtCostService = courtCostService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Tạo bảng giá cho sân.
    /// </summary>
    [HttpPost("api/courts/{courtId:int}/costs")]
    public async Task<IActionResult> CreateCourtCost(int courtId, [FromBody] CreateCourtCostRequest request)
    {
        try
        {
            request.CourtId = courtId;
            var userId = GetCurrentUserId();
            var result = await _courtCostService.CreateCourtCostAsync(userId, request);
            return Ok(ApiResponse<CourtCostResponse>.SuccessResponse(result, "Tạo bảng giá thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Lấy danh sách bảng giá theo sân (public).
    /// </summary>
    [HttpGet("api/courts/{courtId:int}/costs")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCourtCostsByCourt(int courtId)
    {
        var result = await _courtCostService.GetCourtCostsByCourtAsync(courtId);
        return Ok(ApiResponse<List<CourtCostResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Cập nhật bảng giá sân.
    /// </summary>
    [HttpPut("api/court-costs/{courtCostId:int}")]
    public async Task<IActionResult> UpdateCourtCost(int courtCostId, [FromBody] UpdateCourtCostRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _courtCostService.UpdateCourtCostAsync(userId, courtCostId, request);
            return Ok(ApiResponse<CourtCostResponse>.SuccessResponse(result, "Cập nhật bảng giá thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Xóa (soft-delete) bảng giá sân.
    /// </summary>
    [HttpDelete("api/court-costs/{courtCostId:int}")]
    public async Task<IActionResult> DeactivateCourtCost(int courtCostId)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _courtCostService.DeactivateCourtCostAsync(userId, courtCostId);
            return Ok(ApiResponse.SuccessResponse("Đã xóa bảng giá."));
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
    /// Cập nhật hàng loạt bảng giá cho sân (yêu cầu phải kín giờ).
    /// </summary>
    [HttpPut("api/courts/{courtId:int}/costs/bulk")]
    public async Task<IActionResult> BulkUpdateCourtCosts(int courtId, [FromBody] List<BulkCourtCostRequest> requests)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _courtCostService.BulkUpdateCourtCostsAsync(userId, courtId, requests);
            return Ok(ApiResponse<List<CourtCostResponse>>.SuccessResponse(result, "Cập nhật bảng giá hàng loạt thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }
}
