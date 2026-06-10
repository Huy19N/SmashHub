using System;
using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Matchmaking
{
    public class JoinMatchRequest
    {
        [Required]
        public Guid ChallengerTeamId { get; set; }
    }
}
