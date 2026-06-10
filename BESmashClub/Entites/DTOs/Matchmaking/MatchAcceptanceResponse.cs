using System;

namespace Entites.DTOs.Matchmaking;

public class MatchAcceptanceResponse
{
    public Guid AcceptanceId { get; set; }
    public Guid ChallengeId { get; set; }
    public Guid ChallengerTeamId { get; set; }
    public string ChallengerTeamName { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; }
    public DateTime? DecidedAt { get; set; }
    public DateTime? CreatedAt { get; set; }
}
