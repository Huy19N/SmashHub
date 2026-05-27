using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class TeamInviteRepository : GenericRepository<TeamInvite>
{
    public TeamInviteRepository(SmashClubContext context) : base(context) { }

    public async Task<TeamInvite?> GetByTokenAsync(string token)
    {
        return await _context.TeamInvites
            .Include(i => i.Team)
            .Include(i => i.CreatedByUser)
            .FirstOrDefaultAsync(i => i.InviteToken == token);
    }
}
