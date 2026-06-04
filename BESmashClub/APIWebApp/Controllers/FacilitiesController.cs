using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Facilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
[Route("api/facilities")]
[Authorize]
public class FacilitiesController : ControllerBase
{
    private readonly IFacilityService _facilityService;

    public FacilitiesController(IFacilityService facilityService)
    {
        _facilityService = facilityService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Tạo cơ sở mới (chỉ FacilityOwner hoặc Admin).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "FacilityOwner,Admin")]
    public async Task<IActionResult> CreateFacility([FromBody] CreateFacilityRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _facilityService.CreateFacilityAsync(userId, request);
            return Ok(ApiResponse<FacilityResponse>.SuccessResponse(result, "Tạo cơ sở thành công."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Lấy danh sách tất cả cơ sở (public).
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllFacilities()
    {
        var result = await _facilityService.GetAllFacilitiesAsync();
        return Ok(ApiResponse<List<FacilityResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Lấy danh sách cơ sở của user hiện tại (chủ sân).
    /// </summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMyFacilities()
    {
        var userId = GetCurrentUserId();
        var result = await _facilityService.GetFacilitiesByOwnerAsync(userId);
        return Ok(ApiResponse<List<FacilityResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Lấy chi tiết cơ sở (public).
    /// </summary>
    [HttpGet("{facilityId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFacilityDetail(int facilityId)
    {
        try
        {
            var result = await _facilityService.GetFacilityDetailAsync(facilityId);
            return Ok(ApiResponse<FacilityResponse>.SuccessResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Cập nhật thông tin cơ sở (chỉ chủ sở hữu).
    /// </summary>
    [HttpPut("{facilityId:int}")]
    public async Task<IActionResult> UpdateFacility(int facilityId, [FromBody] UpdateFacilityRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _facilityService.UpdateFacilityAsync(userId, facilityId, request);
            return Ok(ApiResponse<FacilityResponse>.SuccessResponse(result, "Cập nhật cơ sở thành công."));
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
