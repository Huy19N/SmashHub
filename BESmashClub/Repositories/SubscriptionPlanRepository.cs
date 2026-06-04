using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class SubscriptionPlanRepository : GenericRepository<SubscriptionPlan>
{
    public SubscriptionPlanRepository(SmashClubContext context) : base(context) { }

    public async Task<SubscriptionPlan?> GetDetailAsync(int planId)
    {
        return await _context.SubscriptionPlans
            .Include(p => p.Tier)
            .FirstOrDefaultAsync(p => p.PlanId == planId);
    }

    public async Task<List<SubscriptionPlan>> GetActivePlansAsync()
    {
        return await _context.SubscriptionPlans
            .Include(p => p.Tier)
            .Where(p => p.IsActive)
            .OrderBy(p => p.TierId)
            .ThenBy(p => p.DurationMonths)
            .ToListAsync();
    }
}
