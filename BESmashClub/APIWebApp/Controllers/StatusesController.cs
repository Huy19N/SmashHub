using Entites.DTOs.Common;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
[Route("api/statuses")]
public class StatusesController : ControllerBase
{
    private readonly IStatusService _statusService;

    public StatusesController(IStatusService statusService)
    {
        _statusService = statusService;
    }

    /// <summary>
    /// Lấy danh sách trạng thái Booking (Pending, Confirmed, Cancelled).
    /// </summary>
    [HttpGet("booking")]
    public async Task<IActionResult> GetBookingStatuses()
    {
        var result = await _statusService.GetBookingStatusesAsync();
        return Ok(ApiResponse<List<StatusResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Lấy danh sách trạng thái Court (Sẵn sàng, Bảo trì).
    /// </summary>
    [HttpGet("court")]
    public async Task<IActionResult> GetCourtStatuses()
    {
        var result = await _statusService.GetCourtStatusesAsync();
        return Ok(ApiResponse<List<StatusResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Lấy danh sách trạng thái Payment (Pending, Paid, Cancelled, Expired, Refunded).
    /// </summary>
    [HttpGet("payment")]
    public async Task<IActionResult> GetPaymentStatuses()
    {
        var result = await _statusService.GetPaymentStatusesAsync();
        return Ok(ApiResponse<List<StatusResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Lấy danh sách trạng thái Payout (Pending, Processing, Completed, Failed).
    /// </summary>
    [HttpGet("payout")]
    public async Task<IActionResult> GetPayoutStatuses()
    {
        var result = await _statusService.GetPayoutStatusesAsync();
        return Ok(ApiResponse<List<StatusResponse>>.SuccessResponse(result));
    }
}
