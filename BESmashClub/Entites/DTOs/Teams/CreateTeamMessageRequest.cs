using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entites.DTOs.Teams
{
    public class CreateTeamMessageRequest
    {
        [Required]
        public Guid TeamId { get; set; }
        [Required]
        public string Content { get; set; } = null!;
        public int MessageType { get; set; } = 0; // 0: message, 1: image, 2: video, 3: document, 4: video call
        public Guid? MediaFileId { get; set; }
    }
}
