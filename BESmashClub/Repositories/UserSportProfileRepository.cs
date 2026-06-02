using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class UserSportProfileRepository : GenericRepository<UserSportProfile>
{
    public UserSportProfileRepository(SmashClubContext context) : base(context) { }

    public async Task<List<UserSportProfile>> GetByUserIdAsync(Guid userId)
    {
        return await _context.UserSportProfiles
            .Include(p => p.SportLevel)
                .ThenInclude(sl => sl.Sport)
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }

    public async Task<UserSportProfile?> GetByUserAndSportAsync(Guid userId, int sportId)
    {
        return await _context.UserSportProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId && p.SportId == sportId);
    }

    public async Task<UserSportProfile?> GetWithDetailsAsync(Guid userId, int sportId)
    {
        return await _context.UserSportProfiles
            .Include(p => p.SportLevel)
                .ThenInclude(sl => sl.Sport)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.SportId == sportId);
    }
}
