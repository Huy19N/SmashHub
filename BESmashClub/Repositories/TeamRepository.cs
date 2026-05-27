using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class TeamRepository : GenericRepository<Team>
{
    public TeamRepository(SmashClubContext context) : base(context) { }

    public async Task<(List<Team> Items, int TotalCount)> SearchAsync(
        string? search, int pageNumber, int pageSize)
    {
        var query = _context.Teams
            .Include(t => t.TeamMembers)
            .Where(t => t.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t => t.TeamName.Contains(search));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<Team?> GetDetailAsync(Guid teamId)
    {
        return await _context.Teams
            .Include(t => t.TeamMembers)
                .ThenInclude(tm => tm.User)
            .Include(t => t.TeamMembers)
                .ThenInclude(tm => tm.TeamRole)
            .FirstOrDefaultAsync(t => t.TeamId == teamId);
    }
}
