namespace Entites.DTOs.Teams;

public class UpdateMemberRequest
{
    public int? TeamRoleId { get; set; }
    public int? Wins { get; set; }
    public int? Losses { get; set; }
}
