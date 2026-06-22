namespace Entites.DTOs.SystemSettings;

public class SystemSettingDto
{
    public string SettingKey { get; set; } = null!;
    public string SettingValue { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
