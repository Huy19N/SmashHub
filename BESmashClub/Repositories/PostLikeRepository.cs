using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class PostLikeRepository : GenericRepository<PostLike>
{
    public PostLikeRepository(SmashClubContext context) : base(context) { }
}
