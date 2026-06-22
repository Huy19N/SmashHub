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
                .ThenInclude(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UserSubscriptions)
                            .ThenInclude(us => us.Plan)
                                .ThenInclude(p => p.Tier)
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

        var challenges = await query.ToListAsync();

        return challenges.OrderByDescending(GetPriority)
                         .ThenByDescending(m => m.CreatedAt)
                         .ToList();
    }

    public static int GetPriority(MatchChallenge m)
    {
        var leader = m.HostTeam?.TeamMembers?.FirstOrDefault(tm => tm.TeamRoleId == 1);
        if (leader == null) return 0;
        
        var activeSub = leader.User?.UserSubscriptions?.FirstOrDefault(us => us.IsActive && us.EndDate > DateTime.Now);
        var tierName = activeSub?.Plan?.Tier?.TierName ?? "Free";

        return tierName switch
        {
            "Pro" => 2,
            "Basic" => 1,
            _ => 0
        };
    }
}
