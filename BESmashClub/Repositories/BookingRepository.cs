using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories
{
    public class BookingRepository : GenericRepository<Booking>
    {
        public BookingRepository(SmashClubContext context) : base(context) { }

        public async Task<Booking?> GetDetailAsync(Guid bookingId)
        {
            return await _context.Bookings
                .Include(b => b.Court).ThenInclude(c => c.Facility)
                .Include(b => b.Court).ThenInclude(c => c.Sport)
                .Include(b => b.BookedByUser)
                .Include(b => b.Status)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);
        }

        public async Task<(List<Booking> Items, int TotalCount)> GetByUserIdAsync(
            Guid userId, int pageNumber, int pageSize)
        {
            var query = _context.Bookings
                .Where(b => b.BookedByUserId == userId)
                .Include(b => b.Court).ThenInclude(c => c.Facility)
                .Include(b => b.Court).ThenInclude(c => c.Sport)
                .Include(b => b.Status)
                .OrderByDescending(b => b.CreatedAt);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<bool> IsTimeSlotAvailableAsync(
            int courtId, DateTime startTime, DateTime endTime, Guid? excludeBookingId = null)
        {
            var query = _context.Bookings
                .Where(b => b.CourtId == courtId
                    && b.StatusId != 3 // Exclude cancelled bookings
                    && b.StartTime < endTime
                    && b.EndTime > startTime);

            if (excludeBookingId.HasValue)
                query = query.Where(b => b.BookingId != excludeBookingId.Value);

            return !await query.AnyAsync();
        }

        public async Task<Court?> GetCourtAsync(int courtId)
        {
            return await _context.Courts
                .Include(c => c.Facility)
                .Include(c => c.Sport)
                .FirstOrDefaultAsync(c => c.CourtId == courtId);
        }
    }
}
