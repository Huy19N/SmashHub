using Entites.DTOs.Courts;

namespace Services.Interfaces;

public interface ICourtService
{
    Task<CourtResponse> CreateCourtAsync(Guid userId, CreateCourtRequest request);
    Task<List<CourtResponse>> GetCourtsByFacilityAsync(int facilityId);
    Task<CourtResponse> GetCourtDetailAsync(int courtId);
    Task<CourtResponse> UpdateCourtAsync(Guid userId, int courtId, UpdateCourtRequest request);
    Task<bool> DeleteCourtAsync(Guid userId, int courtId);
}
