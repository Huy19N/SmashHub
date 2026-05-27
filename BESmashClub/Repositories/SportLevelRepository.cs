using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class SportLevelRepository : GenericRepository<SportLevel>
{
    public SportLevelRepository(SmashClubContext context) : base(context) { }

    public async Task<List<SportLevel>> GetBySportIdAsync(int sportId)
    {
        return await _context.SportLevels
            .Where(sl => sl.SportId == sportId)
            .OrderBy(sl => sl.RankValue)
            .ToListAsync();
    }
}
