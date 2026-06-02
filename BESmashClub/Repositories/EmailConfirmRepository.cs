using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories
{
    public class EmailConfirmRepository : GenericRepository<EmailConfirm>
    {
        public EmailConfirmRepository(SmashClubContext context) : base(context) { }

        public async Task<EmailConfirm?> GetByCodeAndEmailAsync(Guid code, string email)
        {
            return await _context.EmailConfirms
                .FirstOrDefaultAsync(e => e.Code == code && e.Email == email);
        }

        public async Task<EmailConfirm?> GetLatestByEmailAsync(string email)
        {
            return await _context.EmailConfirms
                .Where(e => e.Email == email)
                .OrderByDescending(e => e.CreatedAt)
                .FirstOrDefaultAsync();
        }
    }
}
