using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class CourtCostRepository : GenericRepository<CourtCost>
{
    public CourtCostRepository(SmashClubContext context) : base(context) { }

    public async Task<List<CourtCost>> GetByCourtIdAsync(int courtId)
    {
        return await _context.CourtCosts
            .Include(cc => cc.Court)
            .Where(cc => cc.CourtId == courtId)
            .OrderBy(cc => cc.StartTime)
            .ToListAsync();
    }

    public async Task<List<CourtCost>> GetActiveByCourtIdAsync(int courtId)
    {
        return await _context.CourtCosts
            .Where(cc => cc.CourtId == courtId && cc.IsActive)
            .OrderBy(cc => cc.StartTime)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy các CourtCost active có overlap với khung giờ [startTime, endTime).
    /// </summary>
    public async Task<List<CourtCost>> GetCostsForTimeRangeAsync(int courtId, int dayOfWeek, TimeOnly startTime, TimeOnly endTime)
    {
        return await _context.CourtCosts
            .Where(cc => cc.CourtId == courtId
                && cc.DayOfWeek == dayOfWeek
                && cc.IsActive
                && cc.StartTime < endTime
                && cc.EndTime > startTime)
            .OrderBy(cc => cc.StartTime)
            .ToListAsync();
    }

    /// <summary>
    /// Kiểm tra xem khung giờ mới có bị overlap với CourtCost khác trên cùng court không.
    /// </summary>
    public async Task<bool> HasOverlapAsync(int courtId, int dayOfWeek, TimeOnly startTime, TimeOnly endTime, int? excludeCourtCostId = null)
    {
        var query = _context.CourtCosts
            .Where(cc => cc.CourtId == courtId
                && cc.DayOfWeek == dayOfWeek
                && cc.IsActive
                && cc.StartTime < endTime
                && cc.EndTime > startTime);

        if (excludeCourtCostId.HasValue)
            query = query.Where(cc => cc.CourtCostId != excludeCourtCostId.Value);

        return await query.AnyAsync();
    }

    /// <summary>
    /// Lấy CourtCost theo composite key (CourtCostId, FacilityId).
    /// </summary>
    public async Task<CourtCost?> GetByCompositeKeyAsync(int courtCostId, int facilityId)
    {
        return await _context.CourtCosts
            .Include(cc => cc.Court).ThenInclude(c => c.Facility)
            .FirstOrDefaultAsync(cc => cc.CourtCostId == courtCostId && cc.FacilityId == facilityId);
    }

    /// <summary>
    /// Lấy CourtCost theo CourtCostId (search across all facilities).
    /// </summary>
    public async Task<CourtCost?> GetByCourtCostIdAsync(int courtCostId)
    {
        return await _context.CourtCosts
            .Include(cc => cc.Court).ThenInclude(c => c.Facility)
            .FirstOrDefaultAsync(cc => cc.CourtCostId == courtCostId);
    }
}
