using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Auth;

public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; }
}
