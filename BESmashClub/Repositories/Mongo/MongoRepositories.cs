using Entites.Mongo;
using Microsoft.Extensions.Configuration;

namespace Repositories.Mongo
{
    public interface IPostRepository : IMongoRepository<Post> { }
    public class PostRepository : MongoRepository<Post>, IPostRepository
    {
        public PostRepository(IConfiguration configuration) : base(configuration, "Posts") { }
    }

    public interface IPostCommentRepository : IMongoRepository<PostComment> { }
    public class PostCommentRepository : MongoRepository<PostComment>, IPostCommentRepository
    {
        public PostCommentRepository(IConfiguration configuration) : base(configuration, "PostComments") { }
    }

    public interface IPostLikeRepository : IMongoRepository<PostLike> { }
    public class PostLikeRepository : MongoRepository<PostLike>, IPostLikeRepository
    {
        public PostLikeRepository(IConfiguration configuration) : base(configuration, "PostLikes") { }
    }

    public interface IPostReportRepository : IMongoRepository<PostReport> { }
    public class PostReportRepository : MongoRepository<PostReport>, IPostReportRepository
    {
        public PostReportRepository(IConfiguration configuration) : base(configuration, "PostReports") { }
    }

    public interface ITeamMessageRepository : IMongoRepository<TeamMessage> { }
    public class TeamMessageRepository : MongoRepository<TeamMessage>, ITeamMessageRepository
    {
        public TeamMessageRepository(IConfiguration configuration) : base(configuration, "TeamMessages") { }
    }

    public interface INotificationRepository : IMongoRepository<Notification> { }
    public class NotificationRepository : MongoRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(IConfiguration configuration) : base(configuration, "Notifications") { }
    }
}
