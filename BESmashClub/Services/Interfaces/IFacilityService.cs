using Entites.DTOs.Facilities;

namespace Services.Interfaces;

public interface IFacilityService
{
    Task<FacilityResponse> CreateFacilityAsync(Guid userId, CreateFacilityRequest request);
    Task<List<FacilityResponse>> GetAllFacilitiesAsync();
    Task<List<FacilityResponse>> GetFacilitiesByOwnerAsync(Guid userId);
    Task<FacilityResponse> GetFacilityDetailAsync(int facilityId);
    Task<FacilityResponse> UpdateFacilityAsync(Guid userId, int facilityId, UpdateFacilityRequest request);
}
