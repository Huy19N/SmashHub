using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class NotificationRepository : GenericRepository<Notification>
{
    public NotificationRepository(SmashClubContext context) : base(context) { }
}
