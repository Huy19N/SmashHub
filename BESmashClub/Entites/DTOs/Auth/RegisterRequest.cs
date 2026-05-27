using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Auth;

public class RegisterRequest
{
    [Required]
    [MaxLength(255)]
    public string FullName { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; }

    [Required]
    [MinLength(6)]
    public string Password { get; set; }

    [MaxLength(20)]
    public string PhoneNumber { get; set; }
}
