namespace Entites.DTOs.Teams;

public class TeamMemberResponse
{
    public Guid UserId { get; set; }
    public string FullName { get; set; }
    public string RoleName { get; set; }
    public int Wins { get; set; }
    public int Losses { get; set; }
    public DateTime? JoinedAt { get; set; }
}
