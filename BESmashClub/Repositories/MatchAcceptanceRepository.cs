using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class MatchAcceptanceRepository : GenericRepository<MatchAcceptance>
{
    public MatchAcceptanceRepository(SmashClubContext context) : base(context) { }

    public async Task<MatchAcceptance?> GetDetailAsync(Guid acceptanceId)
    {
        return await _context.Set<MatchAcceptance>()
            .Include(ma => ma.Challenge).ThenInclude(c => c.Schedule).ThenInclude(s => s.Booking)
            .Include(ma => ma.ChallengerTeam)
            .Include(ma => ma.Status)
            .FirstOrDefaultAsync(ma => ma.AcceptanceId == acceptanceId);
    }

    public async Task<List<MatchAcceptance>> GetByChallengeIdAsync(Guid challengeId)
    {
        return await _context.Set<MatchAcceptance>()
            .Where(ma => ma.ChallengeId == challengeId)
            .Include(ma => ma.ChallengerTeam)
            .Include(ma => ma.Status)
            .OrderByDescending(ma => ma.CreatedAt)
            .ToListAsync();
    }
}
