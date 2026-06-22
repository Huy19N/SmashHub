using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class SystemSettingRepository : GenericRepository<SystemSetting>
{
    public SystemSettingRepository(SmashClubContext context) : base(context) { }
}
