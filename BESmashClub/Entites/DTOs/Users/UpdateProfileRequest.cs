using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Users;

public class UpdateProfileRequest
{
    [MaxLength(255)]
    public string FullName { get; set; }

    [MaxLength(20)]
    public string PhoneNumber { get; set; }

    [MaxLength(25)]
    public string? Cccd { get; set; }
}
