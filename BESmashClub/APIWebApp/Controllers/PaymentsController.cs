using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Tạo payment link để thanh toán đăng ký gói Subscription.
    /// </summary>
    [HttpPost("subscription")]
    [Authorize]
    public async Task<IActionResult> CreateSubscriptionPayment([FromBody] CreateSubscriptionPaymentRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _paymentService.CreateSubscriptionPaymentAsync(userId, request);
            return Ok(ApiResponse<PaymentResponse>.SuccessResponse(result, "Tạo link thanh toán thành công. Vui lòng thanh toán qua URL được trả về."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResponse($"Lỗi khi tạo link thanh toán (kiểm tra lại cấu hình PayOS): {ex.Message}"));
        }
    }

    /// <summary>
    /// Xem chi tiết một giao dịch thanh toán.
    /// </summary>
    [HttpGet("{paymentId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetPaymentDetail(Guid paymentId)
    {
        try
        {
            var result = await _paymentService.GetPaymentByIdAsync(paymentId);
            return Ok(ApiResponse<PaymentResponse>.SuccessResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Lấy lịch sử thanh toán của user hiện tại (có phân trang).
    /// </summary>
    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyPayments([FromQuery] PaginationParams pagination)
    {
        var userId = GetCurrentUserId();
        var result = await _paymentService.GetPaymentsByUserAsync(userId, pagination);
        return Ok(ApiResponse<PagedResult<PaymentResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Webhook callback từ PayOS cho thanh toán Subscription.
    /// PayOS gọi endpoint này khi user hoàn tất thanh toán.
    /// </summary>
    [HttpPost("webhook/subscription")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleSubscriptionWebhook()
    {
        try
        {
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();

            await _paymentService.HandleSubscriptionWebhookAsync(body);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            // Log error but still return OK to prevent PayOS from retrying
            Console.WriteLine($"Subscription webhook error: {ex.Message}");
            return Ok(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Webhook callback từ PayOS cho thanh toán Booking (đặt sân).
    /// PayOS gọi endpoint này khi user hoàn tất thanh toán.
    /// </summary>
    [HttpPost("webhook/booking")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleBookingWebhook()
    {
        try
        {
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();

            await _paymentService.HandleBookingWebhookAsync(body);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Booking webhook error: {ex.Message}");
            return Ok(new { success = false, message = ex.Message });
        }
    }
}
