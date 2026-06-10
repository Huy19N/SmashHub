using Entites.DTOs.Auth;

namespace Services.Interfaces;

public interface IAuthService
{
    Task<TokenResponse> RegisterAsync(RegisterRequest request);
    Task<TokenResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent);
    Task<TokenResponse> RefreshTokenAsync(string refreshToken, string ipAddress, string userAgent);
    Task LogoutAsync(Guid userId, string refreshToken);
    Task<TokenResponse> VerifyRegistrationAsync(VerifyEmailRequest request, string ipAddress, string userAgent);
    Task ResendVerificationCodeAsync(string email);
}
