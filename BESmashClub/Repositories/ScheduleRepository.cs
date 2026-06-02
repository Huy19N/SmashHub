using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class ScheduleRepository : GenericRepository<Schedule>
{
    public ScheduleRepository(SmashClubContext context) : base(context) { }

    public async Task<List<Schedule>> GetByTeamIdAsync(Guid teamId)
    {
        return await _context.Schedules
            .Include(s => s.HostTeam)
            .Include(s => s.Booking)
                .ThenInclude(b => b.Court)
                    .ThenInclude(c => c.Facility)
            .Include(s => s.ScheduleParticipants)
            .Where(s => s.HostTeamId == teamId)
            .OrderByDescending(s => s.Booking.StartTime)
            .ToListAsync();
    }

    public async Task<Schedule?> GetDetailAsync(Guid scheduleId)
    {
        return await _context.Schedules
            .Include(s => s.HostTeam)
            .Include(s => s.Booking)
                .ThenInclude(b => b.Court)
                    .ThenInclude(c => c.Facility)
            .Include(s => s.Booking)
                .ThenInclude(b => b.Court)
                    .ThenInclude(c => c.Sport)
            .Include(s => s.ScheduleParticipants)
                .ThenInclude(sp => sp.User)
            .FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);
    }

    public async Task<bool> BookingHasScheduleAsync(Guid bookingId)
    {
        return await _context.Schedules
            .AnyAsync(s => s.BookingId == bookingId);
    }
}
