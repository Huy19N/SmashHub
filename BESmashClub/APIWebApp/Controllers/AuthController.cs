using Entites.DTOs.Auth;
using Entites.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Implementations;
using Services.Interfaces;
using System.Security.Claims;

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

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, 
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    /// <summary>
    /// Đăng ký tài khoản mới (cần xác thực email để kích hoạt).
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            await _authService.RegisterAsync(request);
            return Ok(ApiResponse.SuccessResponse("Đăng ký thành công. Vui lòng xác thực email để kích hoạt tài khoản."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Xác thực đăng ký qua mã OTP (kích hoạt tài khoản và tự động đăng nhập).
    /// </summary>
    [HttpPost("verify-registration")]
    public async Task<IActionResult> VerifyRegistration([FromBody] VerifyEmailRequest request)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

            var result = await _authService.VerifyRegistrationAsync(request, ipAddress, userAgent);
            SetRefreshTokenCookie(result.RefreshToken);
            return Ok(ApiResponse<TokenResponse>.SuccessResponse(result, "Xác thực và kích hoạt tài khoản thành công."));
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
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Gửi lại mã OTP xác nhận tài khoản.
    /// </summary>
    [HttpPost("resend-verification-code")]
    public async Task<IActionResult> ResendVerificationCode([FromBody] string email)
    {
        try
        {
            await _authService.ResendVerificationCodeAsync(email);
            return Ok(ApiResponse.SuccessResponse("Đã gửi lại mã xác nhận qua email. Vui lòng kiểm tra hộp thư."));
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

            var result = await _authService.LoginAsync(request, ipAddress, userAgent);
            SetRefreshTokenCookie(result.RefreshToken);
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
    public async Task<IActionResult> RefreshToken()
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(ApiResponse.ErrorResponse("Không tìm thấy Refresh Token trong cookie."));

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

            var result = await _authService.RefreshTokenAsync(refreshToken, ipAddress, userAgent);
            SetRefreshTokenCookie(result.RefreshToken);
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
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
            return BadRequest(ApiResponse.ErrorResponse("Không tìm thấy Refresh Token."));

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _authService.LogoutAsync(userId, refreshToken);
        Response.Cookies.Delete("refreshToken", new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.None });
        return Ok(ApiResponse.SuccessResponse("Đăng xuất thành công."));
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
