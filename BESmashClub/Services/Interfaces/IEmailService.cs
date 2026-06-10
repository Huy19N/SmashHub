using Entites.Models;

namespace Services.Interfaces;

public interface IEmailService
{
    Task SendEmailConfirmationAsync(string email);
    Task<bool> VerifyEmailNoDeleteAsync(string code, string email);
    Task<bool> VerifyEmailAsync(string code, string email);
    Task SendPasswordResetAsync(string email);
    Task ResetPasswordAsync(string code, string email, string newPassword);
    Task SendBookingNotificationToOwnerAsync(Booking booking);
}
