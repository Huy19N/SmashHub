using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class UserSubscriptionRepository : GenericRepository<UserSubscription>
{
    public UserSubscriptionRepository(SmashClubContext context) : base(context) { }

    public async Task<UserSubscription?> GetActiveSubscriptionAsync(Guid userId)
    {
        return await _context.UserSubscriptions
            .Include(us => us.Plan).ThenInclude(p => p.Tier)
            .Where(us => us.UserId == userId && us.IsActive && us.EndDate > DateTime.Now)
            .OrderByDescending(us => us.EndDate)
            .FirstOrDefaultAsync();
    }

    public async Task DeactivateAllAsync(Guid userId)
    {
        var activeSubscriptions = await _context.UserSubscriptions
            .Where(us => us.UserId == userId && us.IsActive)
            .ToListAsync();

        foreach (var sub in activeSubscriptions)
        {
            sub.IsActive = false;
        }

        await _context.SaveChangesAsync();
    }
}
