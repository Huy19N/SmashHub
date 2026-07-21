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
    /// Đồng bộ trạng thái giao dịch từ PayOS thủ công.
    /// </summary>
    [HttpPost("{orderCode:long}/sync")]
    [Authorize]
    public async Task<IActionResult> SyncPaymentStatus(long orderCode)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _paymentService.SyncPaymentStatusAsync(orderCode, userId);
            return Ok(ApiResponse<bool>.SuccessResponse(success, "Đã đồng bộ trạng thái thanh toán."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Hủy một giao dịch thanh toán (gọi từ frontend khi user bấm Hủy).
    /// </summary>
    [HttpPost("{orderCode:long}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelPayment(long orderCode)
    {
        var userId = GetCurrentUserId();
        var success = await _paymentService.CancelPaymentAsync(orderCode, userId);
        
        if (success)
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Đã hủy thanh toán thành công."));
        
        return BadRequest(ApiResponse.ErrorResponse("Không thể hủy giao dịch này. Có thể giao dịch không tồn tại, đã hoàn tất, hoặc bạn không có quyền."));
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
    /// Webhook callback chung từ PayOS.
    /// PayOS gọi endpoint này khi user hoàn tất thanh toán.
    /// </summary>
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleGeneralWebhook()
    {
        try
        {
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();

            // Gọi cả hai service. Trong PaymentService, mỗi method sẽ tự động kiểm tra xem 
            // webhook đó thuộc loại nào (Subscription hay Booking) thông qua DB. 
            // Nếu không đúng loại nó sẽ tự động ignore.
            await _paymentService.HandleSubscriptionWebhookAsync(body);
            await _paymentService.HandleBookingWebhookAsync(body);

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Webhook error: {ex.Message}");
            return Ok(new { success = false, message = ex.Message });
        }
    }
}
