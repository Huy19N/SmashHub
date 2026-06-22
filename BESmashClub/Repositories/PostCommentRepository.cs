using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Base;
using Repositories.Context;

namespace Repositories;

public class PostCommentRepository : GenericRepository<PostComment>
{
    public PostCommentRepository(SmashClubContext context) : base(context) { }
}
