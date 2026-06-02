using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Auth;

public class ResetPasswordRequest
{
    [Required]
    public Guid Code { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = null!;
}
