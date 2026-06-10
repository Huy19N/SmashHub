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
        public int MessageType { get; set; } = 0; // 0: Text, 1: Image, 2: Video
        public Guid? MediaFileId { get; set; }
    }
}
