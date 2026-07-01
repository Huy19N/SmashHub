using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Entites.DTOs.Auth;
using Entites.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Repositories;
using Repositories.Redis;
using Entites.Redis;
using System.Text.Json;
using Services.Interfaces;
using Services.Settings;

namespace Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IRedisTokenRepository _redisTokenRepository;
    private readonly IRedisEmailConfirmRepository _redisEmailConfirmRepository;
    private readonly UnitOfWork _unitOfWork;
    private readonly JwtSettings _jwtSettings;
    private readonly IEmailService _emailService;

    public AuthService(UnitOfWork unitOfWork, IOptions<JwtSettings> jwtSettings, IEmailService emailService, IRedisTokenRepository redisTokenRepository, IRedisEmailConfirmRepository redisEmailConfirmRepository)
    {
        _redisTokenRepository = redisTokenRepository;
        _redisEmailConfirmRepository = redisEmailConfirmRepository;
        _unitOfWork = unitOfWork;
        _jwtSettings = jwtSettings.Value;
        _emailService = emailService;
    }

    public async Task<TokenResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _unitOfWork.Users.EmailExistsAsync(request.Email))
            throw new InvalidOperationException("Email đã được sử dụng.");

        var user = new User
        {
            UserId = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber,
            RoleId = 2, // User role
            CreatedAt = DateTime.Now,
            LastPwdChange = DateTime.Now,
            IsActive = false // Phải xác thực email để kích hoạt
        };

        await _unitOfWork.Users.CreateAsync(user);

        // Gửi mã OTP xác nhận tài khoản
        await _emailService.SendEmailConfirmationAsync(user.Email);

        return new TokenResponse { AccessToken = string.Empty, RefreshToken = string.Empty };
    }

    public async Task<TokenResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        if (user.BanUntil.HasValue && user.BanUntil.Value > DateTime.Now)
            throw new UnauthorizedAccessException($"Tài khoản của bạn đã bị cấm đến {user.BanUntil.Value:dd/MM/yyyy HH:mm}. Lý do: {user.BanReason}");

        return await GenerateTokenResponseAsync(user, ipAddress, userAgent);
    }

    public async Task<TokenResponse> RefreshTokenAsync(string refreshToken, string ipAddress, string userAgent)
    {
        var storedToken = await _redisTokenRepository.GetRefreshTokenAsync(refreshToken);

        if (storedToken == null)
            throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");

        await _redisTokenRepository.DeleteRefreshTokenAsync(refreshToken);

        var user = await _unitOfWork.Users.GetByIdAsync(storedToken.UserId);
        if (user == null)
            throw new UnauthorizedAccessException("Người dùng không tồn tại.");

        return await GenerateTokenResponseAsync(user, ipAddress, userAgent);
    }

    public async Task LogoutAsync(Guid userId, string refreshToken)
    {
        var storedToken = await _redisTokenRepository.GetRefreshTokenAsync(refreshToken);

        if (storedToken != null && storedToken.UserId == userId)
        {
            await _redisTokenRepository.DeleteRefreshTokenAsync(refreshToken);
        }
    }

    private async Task<TokenResponse> GenerateTokenResponseAsync(User user, string? ipAddress, string? userAgent)
    {
        var jwtId = Guid.NewGuid().ToString();
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);

        var accessToken = GenerateAccessToken(user, jwtId, expiresAt);
        var refreshTokenValue = GenerateRefreshTokenValue();

        // Save refresh token to DB
        var refreshToken = new RefreshToken
        {
            UserId = user.UserId,
            Token = refreshTokenValue,
            JwtId = jwtId,
            CreatedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            IsActive = true,
            Ipaddress = ipAddress,
            UserAgent = userAgent
        };

        await _redisTokenRepository.SetRefreshTokenAsync(refreshToken.Token, refreshToken, TimeSpan.FromDays(_jwtSettings.RefreshTokenExpirationDays));

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            ExpiresAt = expiresAt
        };
    }

    public async Task<TokenResponse> VerifyRegistrationAsync(VerifyEmailRequest request, string ipAddress, string userAgent)
    {
        // 1. Xác thực mã OTP qua EmailService
        await _emailService.VerifyEmailAsync(request.Code, request.Email);

        // 2. Lấy thông tin user
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy người dùng.");

        if (user.IsActive == true)
            throw new InvalidOperationException("Tài khoản đã được xác thực trước đó.");

        // 3. Kích hoạt tài khoản
        user.IsActive = true;
        await _unitOfWork.Users.UpdateAsync(user);

        // 4. Sinh Token        // Issue new token
        return await GenerateTokenResponseAsync(user, "Unknown", "Google Login");
    }

    public async Task ResendVerificationCodeAsync(string email)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(email);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy người dùng với email này.");

        if (user.IsActive == true)
            throw new InvalidOperationException("Tài khoản đã được xác thực và đang hoạt động.");

        await _emailService.SendEmailConfirmationAsync(email);
    }

    private string GenerateAccessToken(User user, string jwtId, DateTime expiresAt)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, jwtId),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.RoleId switch
            {
                1 => "Admin",
                3 => "FacilityOwner",
                _ => "User"
            }),
            new Claim("RoleId", user.RoleId.ToString()),
            new Claim("IsActive", (user.IsActive ?? false).ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshTokenValue()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
}
