using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Entites.Mongo
{
    public class Post
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string UserId { get; set; }
        public string Content { get; set; }
        public List<string> ImageUrls { get; set; }
        public int LikeCount { get; set; }
        public int CommentCount { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Extended for compatibility with old SQL model
        public int PostType { get; set; }
        public Guid? TeamId { get; set; }
        public int? FacilityId { get; set; }
        public bool IsDeleted { get; set; }
        public int Status { get; set; } // 1: Pending, 2: Approved, 3: Rejected
        public List<Guid> MediaFileIds { get; set; } = new List<Guid>();
    }
}
