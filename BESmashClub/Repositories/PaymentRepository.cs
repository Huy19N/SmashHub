using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class PaymentRepository : GenericRepository<Payment>
{
    public PaymentRepository(SmashClubContext context) : base(context) { }

    public async Task<Payment?> GetByOrderCodeAsync(long orderCode)
    {
        return await _context.Payments
            .Include(p => p.User)
            .Include(p => p.Status)
            .FirstOrDefaultAsync(p => p.OrderCode == orderCode);
    }

    public async Task<Payment?> GetDetailAsync(Guid paymentId)
    {
        return await _context.Payments
            .Include(p => p.User)
            .Include(p => p.Status)
            .FirstOrDefaultAsync(p => p.PaymentId == paymentId);
    }

    public async Task<Payment?> GetByReferenceIdAsync(string referenceId, string paymentType)
    {
        return await _context.Payments
            .Include(p => p.User)
            .Include(p => p.Status)
            .Where(p => p.ReferenceId == referenceId && p.PaymentType == paymentType)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<(List<Payment> Items, int TotalCount)> GetByUserIdAsync(
        Guid userId, int pageNumber, int pageSize)
    {
        var query = _context.Payments
            .Where(p => p.UserId == userId)
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
