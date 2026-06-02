using System.Security.Claims;
using Entites.DTOs.Auth;
using Entites.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;

    public AuthController(IAuthService authService, IEmailService emailService)
    {
        _authService = authService;
        _emailService = emailService;
    }

    /// <summary>
    /// Đăng ký tài khoản mới.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(ApiResponse<TokenResponse>.SuccessResponse(result, "Đăng ký thành công."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Đăng nhập (trả về Access Token & Refresh Token).
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

            var result = await _authService.LoginAsync(request, ipAddress??"Not Found", userAgent);
            return Ok(ApiResponse<TokenResponse>.SuccessResponse(result, "Đăng nhập thành công."));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Cấp lại Access Token mới dựa trên Refresh Token.
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

            var result = await _authService.RefreshTokenAsync(request.RefreshToken, ipAddress??"Not Found", userAgent);
            return Ok(ApiResponse<TokenResponse>.SuccessResponse(result, "Token đã được làm mới."));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Đăng xuất (vô hiệu hóa Refresh Token hiện tại).
    /// </summary>
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _authService.LogoutAsync(userId, request.RefreshToken);
        return Ok(ApiResponse.SuccessResponse("Đăng xuất thành công."));
    }

    // ===================== EMAIL CONFIRMATION =====================

    /// <summary>
    /// Gửi email xác nhận đến địa chỉ email.
    /// </summary>
    [HttpPost("send-confirmation")]
    public async Task<IActionResult> SendConfirmation([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            await _emailService.SendEmailConfirmationAsync(request.Email);
            return Ok(ApiResponse.SuccessResponse("Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResponse("Không thể gửi email. Vui lòng thử lại sau."));
        }
    }

    /// <summary>
    /// Xác nhận email bằng mã code.
    /// </summary>
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        try
        {
            await _emailService.VerifyEmailAsync(request.Code, request.Email);
            return Ok(ApiResponse.SuccessResponse("Xác nhận email thành công."));
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

    // ===================== PASSWORD RESET =====================

    /// <summary>
    /// Gửi email đặt lại mật khẩu.
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            await _emailService.SendPasswordResetAsync(request.Email);
            return Ok(ApiResponse.SuccessResponse("Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResponse("Không thể gửi email. Vui lòng thử lại sau."));
        }
    }

    /// <summary>
    /// Đặt lại mật khẩu bằng mã code từ email.
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            await _emailService.ResetPasswordAsync(request.Code, request.Email, request.NewPassword);
            return Ok(ApiResponse.SuccessResponse("Đặt lại mật khẩu thành công."));
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
}
