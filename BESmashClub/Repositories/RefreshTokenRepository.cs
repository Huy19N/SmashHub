using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class RefreshTokenRepository : GenericRepository<RefreshToken>
{
    public RefreshTokenRepository(SmashClubContext context) : base(context) { }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        return await _context.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == token);
    }

    public async Task RevokeAllByUserAsync(Guid userId)
    {
        var tokens = await _context.RefreshTokens
            .Where(r => r.UserId == userId && r.IsActive)
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.IsActive = false;
        }
    }
}
