using Entites.DTOs.SystemSettings;

namespace Services.Interfaces;

public interface ISystemSettingService
{
    Task<List<SystemSettingDto>> GetAllSettingsAsync();
    Task<SystemSettingDto> GetSettingAsync(string key);
    Task<SystemSettingDto> UpdateSettingAsync(string key, UpdateSystemSettingRequest request);
}
