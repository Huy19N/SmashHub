using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Entites.Mongo
{
    public class Notification
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; }

        public string UserId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string NotificationType { get; set; }
        public string RelatedEntityId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
