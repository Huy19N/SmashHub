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

        public string PostId { get; set; }
        public string ReporterId { get; set; }
        public string Reason { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
