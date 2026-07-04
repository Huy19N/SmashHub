using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Entites.Mongo
{
    public class PostReport
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; }

        public string PostId { get; set; } // Giữ lại cho tương thích ngược nếu cần
        public string ReporterId { get; set; }
        public string Reason { get; set; }
        public int TargetType { get; set; } = 1; // 1: Post, 2: Comment
        public string TargetId { get; set; } // ID của Post hoặc Comment
        public int Status { get; set; } = 1; // 1: Pending, 2: Resolved, 3: Dismissed
        public DateTime CreatedAt { get; set; }
    }
}
