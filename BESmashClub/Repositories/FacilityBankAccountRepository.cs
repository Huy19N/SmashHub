using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class FacilityBankAccountRepository : GenericRepository<FacilityBankAccount>
{
    public FacilityBankAccountRepository(SmashClubContext context) : base(context) { }

    public async Task<FacilityBankAccount?> GetByFacilityIdAsync(int facilityId)
    {
        return await _context.FacilityBankAccounts
            .Include(f => f.Facility)
            .FirstOrDefaultAsync(f => f.FacilityId == facilityId);
    }
}
