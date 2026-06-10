using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class PayoutRepository : GenericRepository<Payout>
{
    public PayoutRepository(SmashClubContext context) : base(context) { }

    public async Task<Payout?> GetDetailAsync(Guid payoutId)
    {
        return await _context.Set<Payout>()
            .Include(p => p.Payment)
            .Include(p => p.Facility)
            .Include(p => p.OwnerUser)
            .Include(p => p.Status)
            .FirstOrDefaultAsync(p => p.PayoutId == payoutId);
    }

    public async Task<(List<Payout> Items, int TotalCount)> GetByOwnerIdAsync(
        Guid ownerId, int pageNumber, int pageSize)
    {
        var query = _context.Set<Payout>()
            .Where(p => p.OwnerUserId == ownerId)
            .Include(p => p.Payment)
            .Include(p => p.Facility)
            .Include(p => p.Status)
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
