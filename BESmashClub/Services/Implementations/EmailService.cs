using System.Net;
using System.Net.Mail;
using Entites.Models;
using Microsoft.Extensions.Options;
using Repositories;
using Services.Interfaces;
using Services.Settings;

namespace Services.Implementations;

public class EmailService : IEmailService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly EmailSettings _emailSettings;

    public EmailService(UnitOfWork unitOfWork, IOptions<EmailSettings> emailSettings)
    {
        _unitOfWork = unitOfWork;
        _emailSettings = emailSettings.Value;
    }

    public async Task SendEmailConfirmationAsync(string email)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(email);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy tài khoản với email này.");

        var code = Guid.NewGuid();
        var confirm = new EmailConfirm
        {
            Code = code,
            Email = email,
            CreatedAt = DateTime.Now,
            ExpiredAt = DateTime.Now.AddMinutes(15)
        };

        await _unitOfWork.EmailConfirms.CreateAsync(confirm);

        var subject = "SmashClub - Xác nhận Email";
        var body = BuildConfirmEmailBody(user.FullName, code);

        await SendEmailAsync(email, subject, body);
    }

    public async Task<bool> VerifyEmailAsync(Guid code, string email)
    {
        var confirm = await _unitOfWork.EmailConfirms.GetByCodeAndEmailAsync(code, email);
        if (confirm == null)
            throw new KeyNotFoundException("Mã xác nhận không hợp lệ.");

        if (confirm.ExpiredAt < DateTime.Now)
            throw new InvalidOperationException("Mã xác nhận đã hết hạn. Vui lòng yêu cầu gửi lại.");

        return true;
    }

    public async Task SendPasswordResetAsync(string email)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(email);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy tài khoản với email này.");

        var code = Guid.NewGuid();
        var confirm = new EmailConfirm
        {
            Code = code,
            Email = email,
            CreatedAt = DateTime.Now,
            ExpiredAt = DateTime.Now.AddMinutes(15)
        };

        await _unitOfWork.EmailConfirms.CreateAsync(confirm);

        var subject = "SmashClub - Đặt lại mật khẩu";
        var body = BuildResetPasswordBody(user.FullName, code);

        await SendEmailAsync(email, subject, body);
    }

    public async Task ResetPasswordAsync(Guid code, string email, string newPassword)
    {
        var confirm = await _unitOfWork.EmailConfirms.GetByCodeAndEmailAsync(code, email);
        if (confirm == null)
            throw new KeyNotFoundException("Mã xác nhận không hợp lệ.");

        if (confirm.ExpiredAt < DateTime.Now)
            throw new InvalidOperationException("Mã xác nhận đã hết hạn. Vui lòng yêu cầu gửi lại.");

        var user = await _unitOfWork.Users.GetByEmailAsync(email);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy tài khoản.");

        user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.LastPwdChange = DateTime.Now;

        await _unitOfWork.Users.UpdateAsync(user);
    }

    #region Private Helpers

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        using var smtpClient = new SmtpClient(_emailSettings.SmtpHost, _emailSettings.SmtpPort)
        {
            Credentials = new NetworkCredential(_emailSettings.SenderEmail, _emailSettings.AppPassword),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        mailMessage.To.Add(toEmail);

        await smtpClient.SendMailAsync(mailMessage);
    }

    private static string BuildConfirmEmailBody(string fullName, Guid code)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }}
        .header h1 {{ color: #ffffff; margin: 0; font-size: 28px; }}
        .body {{ padding: 30px; }}
        .body h2 {{ color: #333; }}
        .body p {{ color: #555; line-height: 1.6; }}
        .code-box {{ background: #f0f0f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
        .code-box .code {{ font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; }}
        .footer {{ text-align: center; padding: 20px; color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🏸 SmashClub</h1>
        </div>
        <div class='body'>
            <h2>Xin chào {fullName},</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản SmashClub! Vui lòng sử dụng mã bên dưới để xác nhận email của bạn:</p>
            <div class='code-box'>
                <div class='code'>{code}</div>
            </div>
            <p>Mã này sẽ hết hạn sau <strong>15 phút</strong>.</p>
            <p>Nếu bạn không yêu cầu xác nhận này, vui lòng bỏ qua email này.</p>
        </div>
        <div class='footer'>
            <p>© 2026 SmashClub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }

    private static string BuildResetPasswordBody(string fullName, Guid code)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; }}
        .header h1 {{ color: #ffffff; margin: 0; font-size: 28px; }}
        .body {{ padding: 30px; }}
        .body h2 {{ color: #333; }}
        .body p {{ color: #555; line-height: 1.6; }}
        .code-box {{ background: #fff0f0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
        .code-box .code {{ font-size: 24px; font-weight: bold; color: #f5576c; letter-spacing: 2px; }}
        .footer {{ text-align: center; padding: 20px; color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔐 SmashClub</h1>
        </div>
        <div class='body'>
            <h2>Xin chào {fullName},</h2>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã bên dưới:</p>
            <div class='code-box'>
                <div class='code'>{code}</div>
            </div>
            <p>Mã này sẽ hết hạn sau <strong>15 phút</strong>.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.</p>
        </div>
        <div class='footer'>
            <p>© 2026 SmashClub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }

    #endregion
}
