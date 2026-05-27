using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class TeamMemberRepository : GenericRepository<TeamMember>
{
    public TeamMemberRepository(SmashClubContext context) : base(context) { }

    public async Task<List<TeamMember>> GetByTeamIdAsync(Guid teamId)
    {
        return await _context.TeamMembers
            .Include(tm => tm.User)
            .Include(tm => tm.TeamRole)
            .Where(tm => tm.TeamId == teamId)
            .ToListAsync();
    }

    public async Task<TeamMember?> GetMemberAsync(Guid teamId, Guid userId)
    {
        return await _context.TeamMembers
            .Include(tm => tm.TeamRole)
            .FirstOrDefaultAsync(tm => tm.TeamId == teamId && tm.UserId == userId);
    }

    public async Task<bool> IsLeaderAsync(Guid teamId, Guid userId)
    {
        return await _context.TeamMembers
            .AnyAsync(tm => tm.TeamId == teamId && tm.UserId == userId && tm.TeamRoleId == 1);
    }

    public async Task<bool> IsMemberAsync(Guid teamId, Guid userId)
    {
        return await _context.TeamMembers
            .AnyAsync(tm => tm.TeamId == teamId && tm.UserId == userId);
    }
}
