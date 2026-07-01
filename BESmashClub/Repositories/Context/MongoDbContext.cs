using MongoDB.Driver;
using Entites.Mongo;

namespace Repositories.Context
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(string connectionString, string databaseName)
        {
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
        }

        public IMongoCollection<TeamMessage> TeamMessages => _database.GetCollection<TeamMessage>("TeamMessages");
        public IMongoCollection<Post> Posts => _database.GetCollection<Post>("Posts");
        public IMongoCollection<PostComment> PostComments => _database.GetCollection<PostComment>("PostComments");
        public IMongoCollection<PostLike> PostLikes => _database.GetCollection<PostLike>("PostLikes");
        public IMongoCollection<Notification> Notifications => _database.GetCollection<Notification>("Notifications");
        public IMongoCollection<PostReport> PostReports => _database.GetCollection<PostReport>("PostReports");
    }
}
