using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entites.DTOs.Teams
{
    public class TeamMessageResponse
    {
        public Guid MessageId { get; set; }

        public Guid TeamId { get; set; }

        public Guid SenderId { get; set; }

        public string Content { get; set; } = null!;

        public string? SenderName { get; set; }

        public int MessageType { get; set; }

        public Guid? MediaFileId { get; set; }

        public string? MediaUrl { get; set; }

        public DateTime? SentAt { get; set; }
    }
}
