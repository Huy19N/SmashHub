using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories
{
    public class TeamMessageRepository : GenericRepository<TeamMessage>
    {
        public TeamMessageRepository(SmashClubContext context) : base(context) { }

        public async Task<(List<TeamMessage> Items, int TotalCount)> GetMessagesByTeamIdAsync(
            Guid teamId, string? search, int pageNumber, int pageSize)
        {
            var query = _context.TeamMessages
                .Where(m => m.TeamId == teamId && !m.IsDeleted)
                .Include(m => m.Sender)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(m => m.Content.Contains(search));

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(m => m.SentAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<TeamMessage?> GetMessageWithSenderAsync(Guid messageId)
        {
            return await _context.TeamMessages
                .Include(m => m.Sender)
                .FirstOrDefaultAsync(m => m.MessageId == messageId);
        }
    }
}
