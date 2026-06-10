namespace Entites.DTOs.Matchmaking;

public class MatchChallengeMapResponse
{
    public int FacilityId { get; set; }
    public string FacilityName { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public int ActiveChallengeCount { get; set; }
}
