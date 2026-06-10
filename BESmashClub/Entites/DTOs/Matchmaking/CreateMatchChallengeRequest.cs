using System;
using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Matchmaking;

public class CreateMatchChallengeRequest
{
    [Required]
    public Guid ScheduleId { get; set; }

    [Required]
    public Guid HostTeamId { get; set; }

    [Required]
    public int SportId { get; set; }

    public bool IsCostSplit { get; set; } = true;

    [MaxLength(1000)]
    public string? Message { get; set; }
}
