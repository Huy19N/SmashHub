using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Entites.DTOs.Common;
using Entites.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repositories.Context;
using Services.Interfaces;
using Entites.DTOs.SystemSettings;
using Entites.DTOs.Users;
using Entites.DTOs.Social;

namespace APIWebApp.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly SmashClubContext _context;
    private readonly IFacilityService _facilityService;
    private readonly ISystemSettingService _systemSettingService;
    private readonly INotificationService _notificationService;
    private readonly ISocialService _socialService;
    private readonly IUserService _userService;

    public AdminController(SmashClubContext context, IFacilityService facilityService, ISystemSettingService systemSettingService, INotificationService notificationService, ISocialService socialService, IUserService userService)
    {
        _context = context;
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
        var totalUsers = await _context.Users.CountAsync();
        var totalPlayers = await _context.Users.CountAsync(u => u.RoleId == 2);
        var totalOwners = await _context.Users.CountAsync(u => u.RoleId == 3);
        var totalFacilities = await _context.Facilities.CountAsync();
        var totalCourts = await _context.Courts.CountAsync();
        var totalBookings = await _context.Bookings.CountAsync();
        var totalRevenue = await _context.Payments
            .Where(p => p.StatusId == 2) // Paid
            .SumAsync(p => p.Amount);

        // Recent 10 bookings
        var recentBookings = await _context.Bookings
            .Include(b => b.Court).ThenInclude(c => c.Facility)
            .Include(b => b.BookedByUser)
            .Include(b => b.Status)
            .OrderByDescending(b => b.CreatedAt)
            .Take(10)
            .Select(b => new
            {
                b.BookingId,
                CustomerName = b.BookedByUserId != null ? b.BookedByUser.FullName : b.CustomerNameOffline,
                CustomerEmail = b.BookedByUserId != null ? b.BookedByUser.Email : "Khách vãng lai",
                CourtName = b.Court.CourtName,
                FacilityName = b.Court.Facility.Name,
                b.StartTime,
                b.EndTime,
                b.TotalCost,
                b.StatusId,
                StatusName = b.Status.StatusName,
                b.CreatedAt
            })
            .ToListAsync();

        // Monthly revenue for the past 6 months
        var today = DateTime.Today;
        var monthlyRevenue = new List<object>();
        for (int i = 5; i >= 0; i--)
        {
            var targetMonth = today.AddMonths(-i);
            var startOfMonth = new DateTime(targetMonth.Year, targetMonth.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1).AddTicks(-1);

            var revenue = await _context.Payments
                .Where(p => p.StatusId == 2 && p.PaidAt >= startOfMonth && p.PaidAt <= endOfMonth)
                .SumAsync(p => p.Amount);

            var bookingCount = await _context.Bookings
                .Where(b => b.StatusId == 2 && b.StartTime >= startOfMonth && b.StartTime <= endOfMonth)
                .CountAsync();

            monthlyRevenue.Add(new
            {
                Label = $"{targetMonth.Month}/{targetMonth.Year}",
                Revenue = revenue,
                BookingCount = bookingCount
            });
        }

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            TotalUsers = totalUsers,
            TotalPlayers = totalPlayers,
            TotalOwners = totalOwners,
            TotalFacilities = totalFacilities,
            TotalCourts = totalCourts,
            TotalBookings = totalBookings,
            TotalRevenue = totalRevenue,
            RecentBookings = recentBookings,
            MonthlyRevenue = monthlyRevenue
        }));
    }

    #endregion

    #region 2. User Management

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.UserId,
                u.FullName,
                u.Email,
                u.PhoneNumber,
                u.RoleId,
                RoleName = u.Role.RoleName,
                u.CreatedAt,
                IsActive = u.IsActive ?? false,
                u.BanUntil
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.SuccessResponse(users));
    }

    [HttpPut("users/{userId:guid}/role")]
    public async Task<IActionResult> ChangeUserRole(Guid userId, [FromBody] ChangeRoleRequest request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(ApiResponse.ErrorResponse("Không tìm thấy người dùng."));

        var roleExists = await _context.UserRoles.AnyAsync(r => r.RoleId == request.RoleId);
        if (!roleExists)
            return BadRequest(ApiResponse.ErrorResponse("Role ID không hợp lệ."));

        user.RoleId = request.RoleId;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse.SuccessResponse("Cập nhật quyền thành công."));
    }

    [HttpPut("users/{userId:guid}/status")]
    public async Task<IActionResult> ToggleUserStatus(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(ApiResponse.ErrorResponse("Không tìm thấy người dùng."));

        // Toggle IsActive status
        user.IsActive = !(user.IsActive ?? false);
        await _context.SaveChangesAsync();

        var statusMessage = (user.IsActive ?? false) ? "Kích hoạt tài khoản thành công." : "Khóa tài khoản thành công.";
        return Ok(ApiResponse.SuccessResponse(statusMessage));
    }

    #endregion

    #region 3. Facility Management

    [HttpGet("facilities")]
    public async Task<IActionResult> GetAllFacilities()
    {
        var facilities = await _context.Facilities
            .Include(f => f.Owner)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new
            {
                f.FacilityId,
                f.Name,
                f.City,
                f.District,
                f.Address,
                f.PhoneNumber,
                f.CreatedAt,
                f.StatusId,
                OwnerName = f.Owner.FullName,
                OwnerEmail = f.Owner.Email
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.SuccessResponse(facilities));
    }

    [HttpPut("facilities/{facilityId:int}/approve")]
    public async Task<IActionResult> ApproveFacility(int facilityId)
    {
        try
        {
            await _facilityService.ApproveRejectFacilityAsync(facilityId, 2); // 2: Active/Approved
            
            var facility = await _context.Facilities.FindAsync(facilityId);
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
            
            var facility = await _context.Facilities.FindAsync(facilityId);
            if (facility != null)
            {
                facility.IsDelete = true;
                await _context.SaveChangesAsync();
                
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
            var facility = await _context.Facilities.FindAsync(facilityId);
            if (facility == null)
                return NotFound(ApiResponse.ErrorResponse("Không tìm thấy cơ sở."));
            
            facility.IsDelete = true;
            await _context.SaveChangesAsync();
            return Ok(ApiResponse.SuccessResponse("Xóa cơ sở thành công."));
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
        var requests = await _context.PayoutRequests
            .Include(pr => pr.Facility).ThenInclude(f => f.Owner)
            .Include(pr => pr.BankAccount)
            .OrderByDescending(pr => pr.RequestedAt)
            .Select(pr => new
            {
                pr.PayoutId,
                pr.FacilityId,
                FacilityName = pr.Facility.Name,
                OwnerName = pr.Facility.Owner.FullName,
                OwnerEmail = pr.Facility.Owner.Email,
                pr.Amount,
                pr.BankAccountId,
                pr.BankAccount.BankName,
                pr.BankAccount.AccountNumber,
                pr.BankAccount.AccountHolder,
                pr.StatusId,
                StatusName = pr.StatusId == 1 ? "Pending" : pr.StatusId == 2 ? "Completed" : "Failed",
                pr.TransactionRef,
                pr.RequestedAt,
                pr.ProcessedAt,
                pr.Note
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.SuccessResponse(requests));
    }

    [HttpPut("payout-requests/{payoutId:guid}/approve")]
    public async Task<IActionResult> ApprovePayoutRequest(Guid payoutId, [FromBody] ProcessPayoutRequest request)
    {
        var payoutRequest = await _context.PayoutRequests
            .Include(pr => pr.Facility)
            .FirstOrDefaultAsync(pr => pr.PayoutId == payoutId);

        if (payoutRequest == null)
            return NotFound(ApiResponse.ErrorResponse("Không tìm thấy yêu cầu rút tiền."));

        if (payoutRequest.StatusId != 1)
            return BadRequest(ApiResponse.ErrorResponse("Yêu cầu này đã được xử lý trước đó."));

        // Find facility wallet
        var wallet = await _context.FacilityWallets
            .FirstOrDefaultAsync(w => w.FacilityId == payoutRequest.FacilityId);

        if (wallet == null || wallet.Balance < payoutRequest.Amount)
            return BadRequest(ApiResponse.ErrorResponse("Số dư tài khoản ví của cơ sở không đủ để rút."));

        // Deduct wallet balance
        wallet.Balance -= payoutRequest.Amount;
        wallet.LastUpdatedAt = DateTime.Now;

        // Update payout request
        payoutRequest.StatusId = 2; // Completed
        payoutRequest.ProcessedAt = DateTime.Now;
        payoutRequest.TransactionRef = request.TransactionRef ?? "BANK_TRANSFER_OK";
        payoutRequest.Note = request.Note ?? "Yêu cầu rút tiền được Admin phê duyệt.";

        await _context.SaveChangesAsync();

        return Ok(ApiResponse.SuccessResponse("Phê duyệt và chuyển tiền thành công."));
    }

    [HttpPut("payout-requests/{payoutId:guid}/reject")]
    public async Task<IActionResult> RejectPayoutRequest(Guid payoutId, [FromBody] ProcessPayoutRequest request)
    {
        var payoutRequest = await _context.PayoutRequests.FindAsync(payoutId);

        if (payoutRequest == null)
            return NotFound(ApiResponse.ErrorResponse("Không tìm thấy yêu cầu rút tiền."));

        if (payoutRequest.StatusId != 1)
            return BadRequest(ApiResponse.ErrorResponse("Yêu cầu này đã được xử lý trước đó."));

        // Update payout request
        payoutRequest.StatusId = 3; // Failed/Rejected
        payoutRequest.ProcessedAt = DateTime.Now;
        payoutRequest.Note = request.Note ?? "Yêu cầu rút tiền bị Admin từ chối.";

        await _context.SaveChangesAsync();

        return Ok(ApiResponse.SuccessResponse("Đã từ chối yêu cầu rút tiền."));
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
    
    #endregion
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
