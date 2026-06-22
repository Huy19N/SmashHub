using Entites.DTOs.SystemSettings;
using Entites.Models;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class SystemSettingService : ISystemSettingService
{
    private readonly UnitOfWork _unitOfWork;

    public SystemSettingService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<SystemSettingDto>> GetAllSettingsAsync()
    {
        var settings = await _unitOfWork.SystemSettings.GetAllAsync();
        return settings.Select(MapToDto).ToList();
    }

    public async Task<SystemSettingDto> GetSettingAsync(string key)
    {
        var setting = await _unitOfWork.SystemSettings.GetByIdAsync(key);
        if (setting == null)
            throw new KeyNotFoundException($"Không tìm thấy cài đặt cho khóa {key}.");

        return MapToDto(setting);
    }

    public async Task<SystemSettingDto> UpdateSettingAsync(string key, UpdateSystemSettingRequest request)
    {
        var setting = await _unitOfWork.SystemSettings.GetByIdAsync(key);
        if (setting == null)
        {
            setting = new SystemSetting
            {
                SettingKey = key,
                SettingValue = request.SettingValue,
                Description = request.Description,
                UpdatedAt = DateTime.Now
            };
            await _unitOfWork.SystemSettings.CreateAsync(setting);
        }
        else
        {
            setting.SettingValue = request.SettingValue;
            if (request.Description != null)
                setting.Description = request.Description;
            setting.UpdatedAt = DateTime.Now;
            
            await _unitOfWork.SystemSettings.UpdateAsync(setting);
        }

        return MapToDto(setting);
    }

    private static SystemSettingDto MapToDto(SystemSetting s)
    {
        return new SystemSettingDto
        {
            SettingKey = s.SettingKey,
            SettingValue = s.SettingValue,
            Description = s.Description,
            UpdatedAt = s.UpdatedAt
        };
    }
}
