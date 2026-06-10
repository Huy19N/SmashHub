using System;

namespace Entites.DTOs.Matchmaking;

public class MatchChallengeResponse
{
    public Guid ChallengeId { get; set; }
    public Guid ScheduleId { get; set; }
    public string ScheduleTitle { get; set; }
    public Guid HostTeamId { get; set; }
    public string HostTeamName { get; set; }
    public int SportId { get; set; }
    public string SportName { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; }
    public decimal TotalCost { get; set; }
    public bool IsCostSplit { get; set; }
    public string? Message { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? FacilityName { get; set; }
    public string? CourtName { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}
