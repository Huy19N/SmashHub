using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class ScheduleParticipantRepository : GenericRepository<ScheduleParticipant>
{
    public ScheduleParticipantRepository(SmashClubContext context) : base(context) { }

    public async Task<List<ScheduleParticipant>> GetByScheduleIdAsync(Guid scheduleId)
    {
        return await _context.ScheduleParticipants
            .Include(sp => sp.User)
            .Where(sp => sp.ScheduleId == scheduleId)
            .ToListAsync();
    }

    public async Task<ScheduleParticipant?> GetParticipantAsync(Guid scheduleId, Guid userId)
    {
        return await _context.ScheduleParticipants
            .FirstOrDefaultAsync(sp => sp.ScheduleId == scheduleId && sp.UserId == userId);
    }

    public async Task<int> CountByScheduleIdAsync(Guid scheduleId)
    {
        return await _context.ScheduleParticipants
            .CountAsync(sp => sp.ScheduleId == scheduleId);
    }
}
