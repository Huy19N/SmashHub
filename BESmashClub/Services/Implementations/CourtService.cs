using Entites.DTOs.Courts;
using Entites.Models;
using Microsoft.EntityFrameworkCore;
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
            IsActive = false // Mặc định false, phải thiết lập bảng giá kín giờ mới được active
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

        if (request.IsActive.HasValue && request.IsActive.Value != court.IsActive)
        {
            if (request.IsActive.Value)
            {
                await ValidateCourtCostCoverageAsync(courtId, court.FacilityId);
            }
            court.IsActive = request.IsActive.Value;
        }

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

    private async Task ValidateCourtCostCoverageAsync(int courtId, int facilityId)
    {
        var context = _unitOfWork.Courts.GetContext();
        var hours = await context.Set<FacilityOperatingHour>()
            .Where(oh => oh.FacilityId == facilityId)
            .ToListAsync();

        if (!hours.Any())
            throw new InvalidOperationException("Cơ sở chưa cấu hình Giờ hoạt động. Phải cấu hình giờ trước khi kích hoạt sân.");

        var minOpenTime = hours.Min(h => h.OpenTime);
        var maxCloseTime = hours.Max(h => h.CloseTime);

        var activeCosts = await context.Set<CourtCost>()
            .Where(cc => cc.CourtId == courtId && cc.IsActive)
            .OrderBy(cc => cc.StartTime)
            .ToListAsync();

        if (!activeCosts.Any())
            throw new InvalidOperationException("Sân chưa có bảng giá nào. Vui lòng thiết lập bảng giá kín giờ hoạt động trước khi kích hoạt.");

        if (activeCosts.First().StartTime > minOpenTime)
            throw new InvalidOperationException($"Bảng giá của sân chưa bắt đầu từ {minOpenTime:HH:mm} (giờ mở cửa sớm nhất).");

        if (activeCosts.Last().EndTime < maxCloseTime)
            throw new InvalidOperationException($"Bảng giá của sân chưa kéo dài đến {maxCloseTime:HH:mm} (giờ đóng cửa muộn nhất).");

        for (int i = 0; i < activeCosts.Count - 1; i++)
        {
            if (activeCosts[i].EndTime < activeCosts[i + 1].StartTime)
                throw new InvalidOperationException($"Bảng giá của sân bị hở ở khoảng {activeCosts[i].EndTime:HH:mm} đến {activeCosts[i + 1].StartTime:HH:mm}. Bạn phải thiết lập giá kín giờ.");
        }
    }

    #endregion
}
