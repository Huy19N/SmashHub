using System.Security.Claims;
using Entites.DTOs.Bookings;
using Entites.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Tạo booking mới (đặt sân).
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _bookingService.CreateBookingAsync(userId, request);
            return Ok(ApiResponse<BookingResponse>.SuccessResponse(result, "Đặt sân thành công."));
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

    /// <summary>
    /// Lấy danh sách booking của user hiện tại (có phân trang).
    /// </summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMyBookings([FromQuery] PaginationParams pagination)
    {
        var userId = GetCurrentUserId();
        var result = await _bookingService.GetBookingsByUserAsync(userId, pagination);
        return Ok(ApiResponse<PagedResult<BookingResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Lấy chi tiết một booking.
    /// </summary>
    [HttpGet("{bookingId:guid}")]
    public async Task<IActionResult> GetBookingDetail(Guid bookingId)
    {
        try
        {
            var result = await _bookingService.GetBookingDetailAsync(bookingId);
            return Ok(ApiResponse<BookingResponse>.SuccessResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Cập nhật booking (chỉ khi trạng thái Pending).
    /// </summary>
    [HttpPut("{bookingId:guid}")]
    public async Task<IActionResult> UpdateBooking(Guid bookingId, [FromBody] UpdateBookingRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _bookingService.UpdateBookingAsync(userId, bookingId, request);
            return Ok(ApiResponse<BookingResponse>.SuccessResponse(result, "Cập nhật booking thành công."));
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
    /// Hủy booking.
    /// </summary>
    [HttpDelete("{bookingId:guid}")]
    public async Task<IActionResult> CancelBooking(Guid bookingId)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _bookingService.CancelBookingAsync(userId, bookingId);
            return Ok(ApiResponse.SuccessResponse("Đã hủy booking."));
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
