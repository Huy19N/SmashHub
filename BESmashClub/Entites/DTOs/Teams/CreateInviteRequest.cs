namespace Entites.DTOs.Teams;

public class CreateInviteRequest
{
    public int? MaxUses { get; set; } = 1;

    /// <summary>
    /// Expiration time in hours. Default is 24 hours.
    /// </summary>
    public int ExpirationHours { get; set; } = 24;
}
