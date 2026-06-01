namespace Entites.DTOs.Sports;

public class UserSportProfileResponse
{
    public int SportId { get; set; }
    public string SportName { get; set; }
    public int RankValue { get; set; }
    public string LevelName { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
