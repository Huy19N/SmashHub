using Entites.DTOs.Facilities;

namespace Services.Interfaces;

public interface IFacilityService
{
    Task<FacilityResponse> CreateFacilityAsync(Guid userId, CreateFacilityRequest request);
    Task<List<FacilityResponse>> GetAllFacilitiesAsync();
    Task<List<FacilityResponse>> GetFacilitiesByOwnerAsync(Guid userId);
    Task<FacilityResponse> GetFacilityDetailAsync(int facilityId);
    Task<FacilityResponse> UpdateFacilityAsync(Guid userId, int facilityId, UpdateFacilityRequest request);
    Task<FacilityBankAccountResponse> AddBankAccountAsync(Guid userId, int facilityId, FacilityBankAccountRequest request);
    Task<FacilityBankAccountResponse> UpdateBankAccountAsync(Guid userId, int facilityId, int bankAccountId, FacilityBankAccountRequest request);
    Task DeleteBankAccountAsync(Guid userId, int facilityId, int bankAccountId);
    Task<List<FacilityBankAccountResponse>> GetBankAccountsAsync(Guid userId, int facilityId);
    Task<List<FacilityResponse>> GetFilteredFacilitiesAsync(FacilityFilterRequest request);
    Task<List<CourtAvailabilityResponse>> GetCourtAvailabilitiesAsync(int facilityId, DateTime date);
}
