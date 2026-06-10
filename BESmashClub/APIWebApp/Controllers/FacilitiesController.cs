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
    /// Bộ lọc cơ sở nâng cao (môn thể thao, giá, khoảng cách, thời gian trống).
    /// </summary>
    [HttpGet("filter")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFilteredFacilities([FromQuery] FacilityFilterRequest request)
    {
        try
        {
            var result = await _facilityService.GetFilteredFacilitiesAsync(request);
            return Ok(ApiResponse<List<FacilityResponse>>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Lấy trạng thái chi tiết của các sân trong cơ sở theo ngày (public).
    /// </summary>
    [HttpGet("{facilityId:int}/courts/status")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCourtStatus(int facilityId, [FromQuery] DateTime? date)
    {
        try
        {
            var targetDate = date ?? DateTime.Today;
            var result = await _facilityService.GetCourtAvailabilitiesAsync(facilityId, targetDate);
            return Ok(ApiResponse<List<CourtAvailabilityResponse>>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
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

    /// <summary>
    /// Lấy danh sách tài khoản ngân hàng của cơ sở (chỉ chủ sân).
    /// </summary>
    [HttpGet("{facilityId:int}/bank-accounts")]
    public async Task<IActionResult> GetBankAccounts(int facilityId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _facilityService.GetBankAccountsAsync(userId, facilityId);
            return Ok(ApiResponse<List<FacilityBankAccountResponse>>.SuccessResponse(result));
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
    /// Thêm tài khoản ngân hàng cho cơ sở (chỉ chủ sân).
    /// </summary>
    [HttpPost("{facilityId:int}/bank-accounts")]
    public async Task<IActionResult> AddBankAccount(int facilityId, [FromBody] FacilityBankAccountRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _facilityService.AddBankAccountAsync(userId, facilityId, request);
            return Ok(ApiResponse<FacilityBankAccountResponse>.SuccessResponse(result, "Thêm tài khoản ngân hàng thành công."));
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
    /// Cập nhật tài khoản ngân hàng của cơ sở (chỉ chủ sân).
    /// </summary>
    [HttpPut("{facilityId:int}/bank-accounts/{bankAccountId:int}")]
    public async Task<IActionResult> UpdateBankAccount(int facilityId, int bankAccountId, [FromBody] FacilityBankAccountRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _facilityService.UpdateBankAccountAsync(userId, facilityId, bankAccountId, request);
            return Ok(ApiResponse<FacilityBankAccountResponse>.SuccessResponse(result, "Cập nhật tài khoản ngân hàng thành công."));
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
    /// Xóa tài khoản ngân hàng của cơ sở (chỉ chủ sân).
    /// </summary>
    [HttpDelete("{facilityId:int}/bank-accounts/{bankAccountId:int}")]
    public async Task<IActionResult> DeleteBankAccount(int facilityId, int bankAccountId)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _facilityService.DeleteBankAccountAsync(userId, facilityId, bankAccountId);
            return Ok(ApiResponse.SuccessResponse("Xóa tài khoản ngân hàng thành công."));
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
