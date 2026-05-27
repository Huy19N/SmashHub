using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class SportRepository : GenericRepository<Sport>
{
    public SportRepository(SmashClubContext context) : base(context) { }

    public async Task<List<Sport>> GetAllWithLevelsAsync()
    {
        return await _context.Sports
            .Include(s => s.SportLevels)
            .ToListAsync();
    }
}
