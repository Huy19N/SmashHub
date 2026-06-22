using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Schedules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[Authorize]
[ApiController]
public class SchedulesController : ControllerBase
{
    private readonly IScheduleService _scheduleService;

    public SchedulesController(IScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Tạo lịch chơi mới cho team (Chỉ Leader).
    /// </summary>
    [HttpPost("api/teams/{teamId:guid}/schedules")]
    public async Task<IActionResult> CreateSchedule(Guid teamId, [FromBody] CreateScheduleRequest request)
    {
        try
        {
            var result = await _scheduleService.CreateScheduleAsync(GetCurrentUserId(), teamId, request);
            return CreatedAtAction(nameof(GetScheduleDetail), new { scheduleId = result.ScheduleId },
                ApiResponse<ScheduleResponse>.SuccessResponse(result, "Tạo lịch chơi thành công."));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Lấy danh sách các lịch chơi của một team.
    /// </summary>
    [HttpGet("api/teams/{teamId:guid}/schedules")]
    public async Task<IActionResult> GetTeamSchedules(Guid teamId)
    {
        var result = await _scheduleService.GetSchedulesByTeamAsync(teamId);
        return Ok(ApiResponse<List<ScheduleResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Xem chi tiết một buổi chơi.
    /// </summary>
    [HttpGet("api/schedules/{scheduleId:guid}")]
    public async Task<IActionResult> GetScheduleDetail(Guid scheduleId)
    {
        try
        {
            var result = await _scheduleService.GetScheduleDetailAsync(scheduleId);
            return Ok(ApiResponse<ScheduleResponse>.SuccessResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Cập nhật thông tin buổi chơi (Sửa giờ, chốt chi phí TotalCost).
    /// </summary>
    [HttpPut("api/schedules/{scheduleId:guid}")]
    public async Task<IActionResult> UpdateSchedule(Guid scheduleId, [FromBody] UpdateScheduleRequest request)
    {
        try
        {
            var result = await _scheduleService.UpdateScheduleAsync(GetCurrentUserId(), scheduleId, request);
            return Ok(ApiResponse<ScheduleResponse>.SuccessResponse(result, "Cập nhật lịch chơi thành công."));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Hủy lịch chơi.
    /// </summary>
    [HttpDelete("api/schedules/{scheduleId:guid}")]
    public async Task<IActionResult> DeleteSchedule(Guid scheduleId)
    {
        try
        {
            await _scheduleService.DeleteScheduleAsync(GetCurrentUserId(), scheduleId);
            return Ok(ApiResponse.SuccessResponse("Hủy lịch chơi thành công."));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Tính toán và chia tiền tự động cho các thành viên tham gia.
    /// </summary>
    [HttpPost("api/schedules/{scheduleId:guid}/calculate-split-bill")]
    public async Task<IActionResult> CalculateSplitBill(Guid scheduleId, [FromBody] CalculateSplitBillRequest request)
    {
        try
        {
            await _scheduleService.CalculateAndSaveSplitBillAsync(GetCurrentUserId(), scheduleId, request);
            return Ok(ApiResponse.SuccessResponse("Tính toán và chia tiền thành công."));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
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
}
