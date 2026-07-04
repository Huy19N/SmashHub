using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Entites.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Entites.DTOs.SystemSettings;
using Entites.DTOs.Users;
using Entites.DTOs.Social;
using System.Security.Claims;

namespace APIWebApp.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly IFacilityService _facilityService;
    private readonly ISystemSettingService _systemSettingService;
    private readonly INotificationService _notificationService;
    private readonly ISocialService _socialService;
    private readonly IUserService _userService;

    public AdminController(
        IAdminService adminService, 
        IFacilityService facilityService, 
        ISystemSettingService systemSettingService, 
        INotificationService notificationService, 
        ISocialService socialService, 
        IUserService userService)
    {
        _adminService = adminService;
        _facilityService = facilityService;
        _systemSettingService = systemSettingService;
        _notificationService = notificationService;
        _socialService = socialService;
        _userService = userService;
    }

    #region 1. Statistics & Dashboard

    [HttpGet("statistics")]
    public async Task<IActionResult> GetSystemStatistics()
    {
        var stats = await _adminService.GetSystemStatisticsAsync();
        return Ok(ApiResponse<object>.SuccessResponse(stats));
    }

    #endregion

    #region 2. User Management

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(ApiResponse<object>.SuccessResponse(users));
    }

    [HttpPut("users/{userId:guid}/role")]
    public async Task<IActionResult> ChangeUserRole(Guid userId, [FromBody] ChangeRoleRequest request)
    {
        try
        {
            await _adminService.ChangeUserRoleAsync(userId, request.RoleId);
            return Ok(ApiResponse.SuccessResponse("Cập nhật quyền thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPut("users/{userId:guid}/status")]
    public async Task<IActionResult> ToggleUserStatus(Guid userId)
    {
        try
        {
            var message = await _adminService.ToggleUserStatusAsync(userId);
            return Ok(ApiResponse.SuccessResponse(message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    #endregion

    #region 3. Facility Management

    [HttpGet("facilities")]
    public async Task<IActionResult> GetAllFacilities()
    {
        var facilities = await _adminService.GetAllFacilitiesAsync();
        return Ok(ApiResponse<object>.SuccessResponse(facilities));
    }

    [HttpPut("facilities/{facilityId:int}/approve")]
    public async Task<IActionResult> ApproveFacility(int facilityId)
    {
        try
        {
            await _facilityService.ApproveRejectFacilityAsync(facilityId, 2); // 2: Active/Approved
            
            var facility = await _facilityService.GetFacilityDetailAsync(facilityId);
            if (facility != null)
            {
                await _notificationService.CreateNotificationAsync(
                    facility.OwnerId,
                    "Cơ sở của bạn đã được phê duyệt",
                    $"Cơ sở thể thao '{facility.Name}' của bạn đã được duyệt và hoạt động trên hệ thống.",
                    "FacilityApproved",
                    null
                );
            }
            
            return Ok(ApiResponse.SuccessResponse("Phê duyệt cơ sở thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPut("facilities/{facilityId:int}/reject")]
    public async Task<IActionResult> RejectFacility(int facilityId)
    {
        try
        {
            await _facilityService.ApproveRejectFacilityAsync(facilityId, 3); // 3: Rejected
            
            var facility = await _facilityService.GetFacilityDetailAsync(facilityId);
            if (facility != null)
            {
                await _adminService.DeleteFacilityAsync(facilityId);
                
                await _notificationService.CreateNotificationAsync(
                    facility.OwnerId,
                    "Yêu cầu đăng ký cơ sở bị từ chối",
                    $"Cơ sở '{facility.Name}' của bạn đã bị từ chối đăng ký.",
                    "FacilityRejected",
                    null
                );
            }
            
            return Ok(ApiResponse.SuccessResponse("Từ chối cơ sở thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpDelete("facilities/{facilityId:int}")]
    public async Task<IActionResult> DeleteFacility(int facilityId)
    {
        try
        {
            await _adminService.DeleteFacilityAsync(facilityId);
            return Ok(ApiResponse.SuccessResponse("Xóa cơ sở thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    #endregion

    #region 4. Payout Management

    [HttpGet("payout-requests")]
    public async Task<IActionResult> GetPayoutRequests()
    {
        var requests = await _adminService.GetPayoutRequestsAsync();
        return Ok(ApiResponse<object>.SuccessResponse(requests));
    }

    [HttpPut("payout-requests/{payoutId:guid}/approve")]
    public async Task<IActionResult> ApprovePayoutRequest(Guid payoutId, [FromBody] ProcessPayoutRequest request)
    {
        try
        {
            await _adminService.ApprovePayoutRequestAsync(payoutId, request.TransactionRef, request.Note);
            return Ok(ApiResponse.SuccessResponse("Phê duyệt và chuyển tiền thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPut("payout-requests/{payoutId:guid}/reject")]
    public async Task<IActionResult> RejectPayoutRequest(Guid payoutId, [FromBody] ProcessPayoutRequest request)
    {
        try
        {
            await _adminService.RejectPayoutRequestAsync(payoutId, request.Note);
            return Ok(ApiResponse.SuccessResponse("Đã từ chối yêu cầu rút tiền."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    #endregion

    #region 5. System Settings

    [HttpGet("settings")]
    public async Task<IActionResult> GetSystemSettings()
    {
        var settings = await _systemSettingService.GetAllSettingsAsync();
        return Ok(ApiResponse<List<SystemSettingDto>>.SuccessResponse(settings));
    }

    [HttpPut("settings/{key}")]
    public async Task<IActionResult> UpdateSystemSetting(string key, [FromBody] UpdateSystemSettingRequest request)
    {
        try
        {
            var setting = await _systemSettingService.UpdateSettingAsync(key, request);
            return Ok(ApiResponse<SystemSettingDto>.SuccessResponse(setting, "Cập nhật cài đặt thành công."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    #endregion

    #region 7. Moderation
    
    [HttpGet("posts/pending")]
    public async Task<IActionResult> GetPendingPosts([FromQuery] PaginationParams pagination)
    {
        try
        {
            var result = await _socialService.GetPendingPostsAsync(pagination);
            return Ok(ApiResponse<PagedResult<PostDto>>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPost("posts/{postId:guid}/approve")]
    public async Task<IActionResult> ApprovePost(Guid postId)
    {
        try
        {
            await _socialService.ApprovePostAsync(postId);
            return Ok(ApiResponse.SuccessResponse("Đã duyệt bài viết."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPost("posts/{postId:guid}/reject")]
    public async Task<IActionResult> RejectPost(Guid postId)
    {
        try
        {
            await _socialService.RejectPostAsync(postId);
            return Ok(ApiResponse.SuccessResponse("Đã từ chối bài viết."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPost("users/{userId:guid}/ban")]
    public async Task<IActionResult> BanUser(Guid userId, [FromBody] BanUserRequest request)
    {
        try
        {
            await _userService.BanUserAsync(userId, request.Until, request.Reason);
            return Ok(ApiResponse.SuccessResponse("Đã cấm tài khoản."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPost("users/{userId:guid}/unban")]
    public async Task<IActionResult> UnbanUser(Guid userId)
    {
        try
        {
            await _userService.UnbanUserAsync(userId);
            return Ok(ApiResponse.SuccessResponse("Đã mở khóa tài khoản."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }
    
    [HttpGet("reports/pending")]
    public async Task<IActionResult> GetPendingReports([FromQuery] PaginationParams pagination)
    {
        try
        {
            var result = await _socialService.GetPendingReportsAsync(pagination);
            return Ok(ApiResponse<object>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPost("reports/{reportId}/resolve")]
    public async Task<IActionResult> ResolveReport(string reportId, [FromBody] ResolveReportRequest request)
    {
        try
        {
            var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _socialService.ResolveReportAsync(reportId, currentUserId, request.Action);
            return Ok(ApiResponse.SuccessResponse("Đã xử lý báo cáo."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPost("reports/{reportId}/dismiss")]
    public async Task<IActionResult> DismissReport(string reportId)
    {
        try
        {
            var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _socialService.DismissReportAsync(reportId, currentUserId);
            return Ok(ApiResponse.SuccessResponse("Đã bỏ qua báo cáo."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }
    
    #endregion
}

public class ResolveReportRequest
{
    public string Action { get; set; } // "delete_post", "delete_comment", "ban_user"
}

public class ChangeRoleRequest
{
    public int RoleId { get; set; }
}

public class ProcessPayoutRequest
{
    public string TransactionRef { get; set; }
    public string Note { get; set; }
}
