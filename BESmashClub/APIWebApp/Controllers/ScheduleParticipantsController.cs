using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Schedules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[Authorize]
[ApiController]
[Route("api/schedules/{scheduleId:guid}/participants")]
public class ScheduleParticipantsController : ControllerBase
{
    private readonly IScheduleService _scheduleService;

    public ScheduleParticipantsController(IScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Lấy danh sách những người đăng ký tham gia buổi chơi.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetParticipants(Guid scheduleId)
    {
        var result = await _scheduleService.GetParticipantsAsync(scheduleId);
        return Ok(ApiResponse<List<ParticipantResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Đăng ký tham gia buổi chơi.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> JoinSchedule(Guid scheduleId)
    {
        try
        {
            var result = await _scheduleService.JoinScheduleAsync(GetCurrentUserId(), scheduleId);
            return Ok(ApiResponse<ParticipantResponse>.SuccessResponse(result, "Đăng ký tham gia thành công."));
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
    /// Hủy đăng ký tham gia.
    /// </summary>
    [HttpDelete("me")]
    public async Task<IActionResult> LeaveSchedule(Guid scheduleId)
    {
        try
        {
            await _scheduleService.LeaveScheduleAsync(GetCurrentUserId(), scheduleId);
            return Ok(ApiResponse.SuccessResponse("Hủy đăng ký tham gia thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Điểm danh (Leader cập nhật trạng thái IsAttended).
    /// </summary>
    [HttpPatch("{userId:guid}/attendance")]
    public async Task<IActionResult> UpdateAttendance(
        Guid scheduleId, Guid userId, [FromBody] UpdateAttendanceRequest request)
    {
        try
        {
            await _scheduleService.UpdateAttendanceAsync(GetCurrentUserId(), scheduleId, userId, request);
            return Ok(ApiResponse.SuccessResponse("Cập nhật điểm danh thành công."));
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
}
