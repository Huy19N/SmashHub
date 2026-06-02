using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Auth;

public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}
