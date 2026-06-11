using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class FacilityRepository : GenericRepository<Facility>
{
    public FacilityRepository(SmashClubContext context) : base(context) { }

    public async Task<List<Facility>> GetByOwnerIdAsync(Guid ownerId)
    {
        return await _context.Facilities
            .Include(f => f.Owner)
            .Include(f => f.Courts)
            .Where(f => f.OwnerId == ownerId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Facility>> GetAllWithDetailsAsync()
    {
        return await _context.Facilities
            .Include(f => f.Owner)
            .Include(f => f.Courts)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<Facility?> GetDetailAsync(int facilityId)
    {
        return await _context.Facilities
            .Include(f => f.Owner)
            .Include(f => f.Courts).ThenInclude(c => c.Sport)
            .Include(f => f.Courts).ThenInclude(c => c.Status)
            .Include(f => f.Courts).ThenInclude(c => c.CourtCosts)
            .FirstOrDefaultAsync(f => f.FacilityId == facilityId);
    }

    public async Task<bool> IsOwnerAsync(int facilityId, Guid userId)
    {
        return await _context.Facilities
            .AnyAsync(f => f.FacilityId == facilityId && f.OwnerId == userId);
    }
}
