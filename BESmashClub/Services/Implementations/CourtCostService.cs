using Entites.DTOs.CourtCosts;
using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class CourtCostService : ICourtCostService
{
    private readonly UnitOfWork _unitOfWork;

    public CourtCostService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CourtCostResponse> CreateCourtCostAsync(Guid userId, CreateCourtCostRequest request)
    {
        // Validate court exists
        var court = await _unitOfWork.Courts.GetDetailAsync(request.CourtId);
        if (court == null)
            throw new KeyNotFoundException("Không tìm thấy sân.");

        // Check ownership via facility
        if (!await _unitOfWork.Facilities.IsOwnerAsync(court.FacilityId, userId))
            throw new UnauthorizedAccessException("Bạn không có quyền quản lý giá sân này.");

        // Validate time range
        if (request.StartTime >= request.EndTime)
            throw new InvalidOperationException("Giờ bắt đầu phải trước giờ kết thúc.");

        // Check overlap with existing CourtCosts on same court
        if (await _unitOfWork.CourtCosts.HasOverlapAsync(request.CourtId, request.StartTime, request.EndTime))
            throw new InvalidOperationException("Khung giờ này bị trùng với bảng giá đã có.");

        var courtCost = new CourtCost
        {
            FacilityId = court.FacilityId,
            CourtId = request.CourtId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            DurationMinutes = request.DurationMinutes,
            Cost = request.Cost,
            IsActive = true
        };

        await _unitOfWork.CourtCosts.CreateAsync(courtCost);

        return MapToResponse(courtCost, court.CourtName);
    }

    public async Task<List<CourtCostResponse>> GetCourtCostsByCourtAsync(int courtId)
    {
        var courtCosts = await _unitOfWork.CourtCosts.GetByCourtIdAsync(courtId);
        return courtCosts.Select(cc => MapToResponse(cc, cc.Court?.CourtName)).ToList();
    }

    public async Task<CourtCostResponse> UpdateCourtCostAsync(Guid userId, int courtCostId, UpdateCourtCostRequest request)
    {
        var courtCost = await _unitOfWork.CourtCosts.GetByCourtCostIdAsync(courtCostId);
        if (courtCost == null)
            throw new KeyNotFoundException("Không tìm thấy bảng giá.");

        // Check ownership via facility
        if (!await _unitOfWork.Facilities.IsOwnerAsync(courtCost.FacilityId, userId))
            throw new UnauthorizedAccessException("Bạn không có quyền cập nhật giá sân này.");

        var newStart = request.StartTime ?? courtCost.StartTime;
        var newEnd = request.EndTime ?? courtCost.EndTime;

        if (newStart >= newEnd)
            throw new InvalidOperationException("Giờ bắt đầu phải trước giờ kết thúc.");

        // Check overlap if time changed
        if (request.StartTime.HasValue || request.EndTime.HasValue)
        {
            if (await _unitOfWork.CourtCosts.HasOverlapAsync(courtCost.CourtId, newStart, newEnd, courtCostId))
                throw new InvalidOperationException("Khung giờ này bị trùng với bảng giá đã có.");
        }

        courtCost.StartTime = newStart;
        courtCost.EndTime = newEnd;

        if (request.DurationMinutes.HasValue)
            courtCost.DurationMinutes = request.DurationMinutes.Value;

        if (request.Cost.HasValue)
            courtCost.Cost = request.Cost.Value;

        if (request.IsActive.HasValue)
            courtCost.IsActive = request.IsActive.Value;

        await _unitOfWork.CourtCosts.UpdateAsync(courtCost);

        var court = await _unitOfWork.Courts.GetByIdAsync(courtCost.CourtId);
        return MapToResponse(courtCost, court?.CourtName);
    }

    public async Task DeactivateCourtCostAsync(Guid userId, int courtCostId)
    {
        var courtCost = await _unitOfWork.CourtCosts.GetByCourtCostIdAsync(courtCostId);
        if (courtCost == null)
            throw new KeyNotFoundException("Không tìm thấy bảng giá.");

        if (!await _unitOfWork.Facilities.IsOwnerAsync(courtCost.FacilityId, userId))
            throw new UnauthorizedAccessException("Bạn không có quyền xóa giá sân này.");

        courtCost.IsActive = false;
        await _unitOfWork.CourtCosts.UpdateAsync(courtCost);
    }

    public async Task<List<CourtCostResponse>> BulkUpdateCourtCostsAsync(Guid userId, int courtId, List<BulkCourtCostRequest> requests)
    {
        var court = await _unitOfWork.Courts.GetDetailAsync(courtId);
        if (court == null) throw new KeyNotFoundException("Không tìm thấy sân.");
        if (!await _unitOfWork.Facilities.IsOwnerAsync(court.FacilityId, userId))
            throw new UnauthorizedAccessException("Bạn không có quyền quản lý giá sân này.");

        if (requests == null || !requests.Any())
            throw new InvalidOperationException("Danh sách bảng giá không được trống.");

        // Validate individual items
        foreach (var req in requests)
        {
            if (req.StartTime >= req.EndTime)
                throw new InvalidOperationException($"Khung giờ {req.StartTime} - {req.EndTime} không hợp lệ.");
        }

        // Sort requests
        requests = requests.OrderBy(r => r.StartTime).ToList();

        // Check for overlaps internally in the request
        for (int i = 0; i < requests.Count - 1; i++)
        {
            if (requests[i].EndTime > requests[i + 1].StartTime)
                throw new InvalidOperationException("Các khung giờ gửi lên bị trùng lặp với nhau.");
        }

        var context = _unitOfWork.CourtCosts.GetContext();
        var hours = await context.Set<FacilityOperatingHour>()
            .Where(oh => oh.FacilityId == court.FacilityId)
            .ToListAsync();

        if (!hours.Any())
            throw new InvalidOperationException("Bạn phải cấu hình Giờ hoạt động cho cơ sở trước khi cài đặt giá sân.");

        var minOpenTime = hours.Min(h => h.OpenTime);
        var maxCloseTime = hours.Max(h => h.CloseTime);

        // Validate full coverage
        if (requests.First().StartTime > minOpenTime)
            throw new InvalidOperationException($"Bảng giá phải bắt đầu từ {minOpenTime:HH:mm} (giờ mở cửa sớm nhất của cơ sở).");
        
        if (requests.Last().EndTime < maxCloseTime)
            throw new InvalidOperationException($"Bảng giá phải kéo dài đến {maxCloseTime:HH:mm} (giờ đóng cửa muộn nhất của cơ sở).");

        for (int i = 0; i < requests.Count - 1; i++)
        {
            if (requests[i].EndTime < requests[i + 1].StartTime)
                throw new InvalidOperationException($"Bảng giá bị hở ở khoảng {requests[i].EndTime:HH:mm} đến {requests[i + 1].StartTime:HH:mm}. Bạn phải cấu hình kín giờ.");
        }

        // Delete old
        var oldCosts = await context.Set<CourtCost>().Where(cc => cc.CourtId == courtId).ToListAsync();
        context.Set<CourtCost>().RemoveRange(oldCosts);

        // Insert new
        var newCosts = requests.Select(r => new CourtCost
        {
            FacilityId = court.FacilityId,
            CourtId = courtId,
            StartTime = r.StartTime,
            EndTime = r.EndTime,
            DurationMinutes = r.DurationMinutes,
            Cost = r.Cost,
            IsActive = true
        }).ToList();

        await context.Set<CourtCost>().AddRangeAsync(newCosts);
        await context.SaveChangesAsync();

        return newCosts.Select(cc => MapToResponse(cc, court.CourtName)).ToList();
    }

    public async Task ValidateCourtCostCoverageAsync(int courtId)
    {
        var court = await _unitOfWork.Courts.GetDetailAsync(courtId);
        if (court == null) throw new KeyNotFoundException("Không tìm thấy sân.");

        var context = _unitOfWork.CourtCosts.GetContext();
        var hours = await context.Set<FacilityOperatingHour>()
            .Where(oh => oh.FacilityId == court.FacilityId)
            .ToListAsync();

        if (!hours.Any())
            throw new InvalidOperationException("Bạn phải cấu hình Giờ hoạt động cho cơ sở trước khi kích hoạt sân.");

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

    #region Helpers

    private static CourtCostResponse MapToResponse(CourtCost cc, string? courtName)
    {
        return new CourtCostResponse
        {
            CourtCostId = cc.CourtCostId,
            FacilityId = cc.FacilityId,
            CourtId = cc.CourtId,
            CourtName = courtName,
            StartTime = cc.StartTime,
            EndTime = cc.EndTime,
            DurationMinutes = cc.DurationMinutes,
            Cost = cc.Cost,
            IsActive = cc.IsActive
        };
    }

    #endregion
}
