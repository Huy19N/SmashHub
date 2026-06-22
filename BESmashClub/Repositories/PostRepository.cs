using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class PostRepository : GenericRepository<Post>
{
    public PostRepository(SmashClubContext context) : base(context) { }
}
