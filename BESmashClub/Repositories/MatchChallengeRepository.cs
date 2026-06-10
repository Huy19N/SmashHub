using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class MatchChallengeRepository : GenericRepository<MatchChallenge>
{
    public MatchChallengeRepository(SmashClubContext context) : base(context) { }

    public async Task<MatchChallenge?> GetDetailAsync(Guid challengeId)
    {
        return await _context.Set<MatchChallenge>()
            .Include(m => m.Schedule).ThenInclude(s => s.Booking).ThenInclude(b => b.Court).ThenInclude(c => c.Facility)
            .Include(m => m.HostTeam)
            .Include(m => m.Sport)
            .Include(m => m.Status)
            .FirstOrDefaultAsync(m => m.ChallengeId == challengeId);
    }

    public async Task<List<MatchChallenge>> GetActiveChallengesAsync(int? sportId, string? city, string? district)
    {
        var query = _context.Set<MatchChallenge>()
            .Where(m => m.StatusId == 1) // 1: Open
            .Include(m => m.Schedule).ThenInclude(s => s.Booking).ThenInclude(b => b.Court).ThenInclude(c => c.Facility)
            .Include(m => m.HostTeam)
            .Include(m => m.Sport)
            .Include(m => m.Status)
            .AsQueryable();

        if (sportId.HasValue)
        {
            query = query.Where(m => m.SportId == sportId.Value);
        }

        if (!string.IsNullOrEmpty(city))
        {
            query = query.Where(m => m.Schedule.Booking.Court.Facility.City == city);
        }

        if (!string.IsNullOrEmpty(district))
        {
            query = query.Where(m => m.Schedule.Booking.Court.Facility.District == district);
        }

        return await query.OrderByDescending(m => m.CreatedAt).ToListAsync();
    }
}
