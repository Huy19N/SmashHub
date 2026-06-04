using Entites.DTOs.Facilities;
using Entites.Models;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class FacilityService : IFacilityService
{
    private readonly UnitOfWork _unitOfWork;

    public FacilityService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<FacilityResponse> CreateFacilityAsync(Guid userId, CreateFacilityRequest request)
    {
        var facility = new Facility
        {
            OwnerId = userId,
            Name = request.Name,
            City = request.City,
            District = request.District,
            Address = request.Address,
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.Facilities.CreateAsync(facility);

        return await GetFacilityDetailAsync(facility.FacilityId);
    }

    public async Task<List<FacilityResponse>> GetAllFacilitiesAsync()
    {
        var facilities = await _unitOfWork.Facilities.GetAllWithDetailsAsync();
        return facilities.Select(MapToResponse).ToList();
    }

    public async Task<List<FacilityResponse>> GetFacilitiesByOwnerAsync(Guid userId)
    {
        var facilities = await _unitOfWork.Facilities.GetByOwnerIdAsync(userId);
        return facilities.Select(MapToResponse).ToList();
    }

    public async Task<FacilityResponse> GetFacilityDetailAsync(int facilityId)
    {
        var facility = await _unitOfWork.Facilities.GetDetailAsync(facilityId);
        if (facility == null)
            throw new KeyNotFoundException("Không tìm thấy cơ sở.");

        return MapToResponse(facility);
    }

    public async Task<FacilityResponse> UpdateFacilityAsync(Guid userId, int facilityId, UpdateFacilityRequest request)
    {
        var facility = await _unitOfWork.Facilities.GetDetailAsync(facilityId);
        if (facility == null)
            throw new KeyNotFoundException("Không tìm thấy cơ sở.");

        if (facility.OwnerId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền cập nhật cơ sở này.");

        if (!string.IsNullOrWhiteSpace(request.Name))
            facility.Name = request.Name;

        if (!string.IsNullOrWhiteSpace(request.City))
            facility.City = request.City;

        if (!string.IsNullOrWhiteSpace(request.District))
            facility.District = request.District;

        if (request.Address != null)
            facility.Address = request.Address;

        await _unitOfWork.Facilities.UpdateAsync(facility);

        return await GetFacilityDetailAsync(facilityId);
    }

    #region Helpers

    private static FacilityResponse MapToResponse(Facility f)
    {
        return new FacilityResponse
        {
            FacilityId = f.FacilityId,
            OwnerId = f.OwnerId,
            OwnerName = f.Owner?.FullName,
            Name = f.Name,
            City = f.City,
            District = f.District,
            Address = f.Address,
            CourtCount = f.Courts?.Count ?? 0,
            CreatedAt = f.CreatedAt
        };
    }

    #endregion
}
