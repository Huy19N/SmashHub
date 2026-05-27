using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Users;

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; }

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; }
}
