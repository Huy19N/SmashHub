using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Auth;

public class VerifyEmailRequest
{
    [Required]
    public Guid Code { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}
