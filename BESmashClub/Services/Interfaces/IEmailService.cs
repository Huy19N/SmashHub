namespace Services.Interfaces;

public interface IEmailService
{
    Task SendEmailConfirmationAsync(string email);
    Task<bool> VerifyEmailAsync(Guid code, string email);
    Task SendPasswordResetAsync(string email);
    Task ResetPasswordAsync(Guid code, string email, string newPassword);
}
