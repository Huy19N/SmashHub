using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.SystemSettings;

public class UpdateSystemSettingRequest
{
    [Required]
    public string SettingValue { get; set; } = null!;

    public string? Description { get; set; }
}
