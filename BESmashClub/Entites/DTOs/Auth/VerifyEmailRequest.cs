using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Auth;

public class VerifyEmailRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [StringLength(5, MinimumLength = 5)]
    public string Code { get; set; }
}
