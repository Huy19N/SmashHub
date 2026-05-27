namespace Entites.DTOs.Teams;

public class InviteInfoResponse
{
    public string InviteToken { get; set; }
    public Guid TeamId { get; set; }
    public string TeamName { get; set; }
    public string CreatedByUserName { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime ExpiredAt { get; set; }
    public int? MaxUses { get; set; }
    public int? CurrentUses { get; set; }
    public bool IsValid { get; set; }
}
