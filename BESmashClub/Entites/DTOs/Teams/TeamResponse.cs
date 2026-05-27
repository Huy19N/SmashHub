namespace Entites.DTOs.Teams;

public class TeamResponse
{
    public Guid TeamId { get; set; }
    public string TeamName { get; set; }
    public string Description { get; set; }
    public DateTime? CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public int MemberCount { get; set; }
}
