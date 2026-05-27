using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Entites.DTOs.Auth;
using Entites.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Repositories;
using Services.Interfaces;
using Services.Settings;

namespace Services.Implementations;

public class AuthService : IAuthService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly JwtSettings _jwtSettings;

    public AuthService(UnitOfWork unitOfWork, IOptions<JwtSettings> jwtSettings)
    {
        _unitOfWork = unitOfWork;
        _jwtSettings = jwtSettings.Value;
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
            IsActive = true
        };

        await _unitOfWork.Users.CreateAsync(user);

        return GenerateTokenResponse(user, null, null);
    }

    public async Task<TokenResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        if (user.IsActive != true)
            throw new UnauthorizedAccessException("Tài khoản đã bị vô hiệu hóa.");

        return GenerateTokenResponse(user, ipAddress, userAgent);
    }

    public async Task<TokenResponse> RefreshTokenAsync(string refreshToken, string ipAddress, string userAgent)
    {
        var storedToken = await _unitOfWork.RefreshTokens.GetByTokenAsync(refreshToken);

        if (storedToken == null || !storedToken.IsActive || storedToken.ExpiredAt < DateTime.Now)
            throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");

        // Revoke the old refresh token
        storedToken.IsActive = false;
        await _unitOfWork.SaveChangesAsync();

        var user = storedToken.User;
        return GenerateTokenResponse(user, ipAddress, userAgent);
    }

    public async Task LogoutAsync(Guid userId, string refreshToken)
    {
        var storedToken = await _unitOfWork.RefreshTokens.GetByTokenAsync(refreshToken);

        if (storedToken != null && storedToken.UserId == userId)
        {
            storedToken.IsActive = false;
            await _unitOfWork.SaveChangesAsync();
        }
    }

    private TokenResponse GenerateTokenResponse(User user, string? ipAddress, string? userAgent)
    {
        var jwtId = Guid.NewGuid().ToString();
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);

        var accessToken = GenerateAccessToken(user, jwtId, expiresAt);
        var refreshTokenValue = GenerateRefreshTokenValue();

        // Save refresh token to DB
        var refreshToken = new RefreshToken
        {
            RefreshTokenId = Guid.NewGuid(),
            UserId = user.UserId,
            Token = refreshTokenValue,
            JwtId = jwtId,
            CreatedAt = DateTime.Now,
            ExpiredAt = DateTime.Now.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            IsActive = true,
            Ipaddress = ipAddress,
            UserAgent = userAgent
        };

        _unitOfWork.RefreshTokens.PrepareCreate(refreshToken);
        _unitOfWork.SaveChangesAsync().GetAwaiter().GetResult();

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            ExpiresAt = expiresAt
        };
    }

    private string GenerateAccessToken(User user, string jwtId, DateTime expiresAt)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, jwtId),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.RoleId == 1 ? "Admin" : "User")
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
