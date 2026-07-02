using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Entites.Mongo
{
    public class TeamMessage
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; }

        public string TeamId { get; set; }
        public string SenderId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public int MessageType { get; set; }
        public string FileUrl { get; set; }
        public Guid? MediaFileId { get; set; }
        public bool IsDeleted { get; set; }
    }
}
