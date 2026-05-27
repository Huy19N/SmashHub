namespace Entites.DTOs.Teams;

public class TeamDetailResponse
{
    public Guid TeamId { get; set; }
    public string TeamName { get; set; }
    public string Description { get; set; }
    public DateTime? CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public List<TeamMemberResponse> Members { get; set; } = new();
}
