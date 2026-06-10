using Entites.DTOs.Courts;
using Entites.Models;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class CourtService : ICourtService
{
    private readonly UnitOfWork _unitOfWork;

    public CourtService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CourtResponse> CreateCourtAsync(Guid userId, CreateCourtRequest request)
    {
        // Validate facility exists and user is owner
        var facility = await _unitOfWork.Facilities.GetByIdAsync(request.FacilityId);
        if (facility == null)
            throw new KeyNotFoundException("Không tìm thấy cơ sở.");

        if (facility.OwnerId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền thêm sân cho cơ sở này.");

        // Validate sport exists
        var sport = await _unitOfWork.Sports.GetByIdAsync(request.SportId);
        if (sport == null)
            throw new KeyNotFoundException("Không tìm thấy môn thể thao.");

        var court = new Court
        {
            FacilityId = request.FacilityId,
            SportId = request.SportId,
            CourtName = request.CourtName,
            StatusId = 1, // Sẵn sàng
            IsActive = true
        };

        await _unitOfWork.Courts.CreateAsync(court);

        return await GetCourtDetailAsync(court.CourtId);
    }

    public async Task<List<CourtResponse>> GetCourtsByFacilityAsync(int facilityId)
    {
        var courts = await _unitOfWork.Courts.GetByFacilityIdAsync(facilityId);
        return courts.Select(MapToResponse).ToList();
    }

    public async Task<CourtResponse> GetCourtDetailAsync(int courtId)
    {
        var court = await _unitOfWork.Courts.GetDetailAsync(courtId);
        if (court == null)
            throw new KeyNotFoundException("Không tìm thấy sân.");

        return MapToResponse(court);
    }

    public async Task<CourtResponse> UpdateCourtAsync(Guid userId, int courtId, UpdateCourtRequest request)
    {
        var court = await _unitOfWork.Courts.GetDetailAsync(courtId);
        if (court == null)
            throw new KeyNotFoundException("Không tìm thấy sân.");

        // Check ownership via facility
        if (!await _unitOfWork.Facilities.IsOwnerAsync(court.FacilityId, userId))
            throw new UnauthorizedAccessException("Bạn không có quyền cập nhật sân này.");

        if (!string.IsNullOrWhiteSpace(request.CourtName))
            court.CourtName = request.CourtName;

        if (request.SportId.HasValue)
        {
            var sport = await _unitOfWork.Sports.GetByIdAsync(request.SportId.Value);
            if (sport == null)
                throw new KeyNotFoundException("Không tìm thấy môn thể thao.");
            court.SportId = request.SportId.Value;
        }

        if (request.StatusId.HasValue)
            court.StatusId = request.StatusId.Value;

        if (request.IsActive.HasValue)
            court.IsActive = request.IsActive.Value;

        await _unitOfWork.Courts.UpdateAsync(court);

        return await GetCourtDetailAsync(courtId);
    }

    public async Task<bool> DeleteCourtAsync(Guid userId, int courtId)
    {
        var court = await _unitOfWork.Courts.GetByIdAsync(courtId);
        if (court == null)
            throw new KeyNotFoundException("Không tìm thấy sân.");

        // Check ownership via facility
        if (!await _unitOfWork.Facilities.IsOwnerAsync(court.FacilityId, userId))
            throw new UnauthorizedAccessException("Bạn không có quyền xóa sân này.");

        await _unitOfWork.Courts.RemoveAsync(court);
        return true;
    }

    #region Helpers

    private static CourtResponse MapToResponse(Court c)
    {
        return new CourtResponse
        {
            CourtId = c.CourtId,
            FacilityId = c.FacilityId,
            FacilityName = c.Facility?.Name,
            SportId = c.SportId,
            SportName = c.Sport?.SportName,
            CourtName = c.CourtName,
            StatusId = c.StatusId,
            StatusName = c.Status?.StatusName,
            IsActive = c.IsActive
        };
    }

    #endregion
}
