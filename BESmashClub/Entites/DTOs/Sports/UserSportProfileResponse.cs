namespace Entites.DTOs.Sports;

public class UserSportProfileResponse
{
    public Guid ProfileId { get; set; }
    public int SportId { get; set; }
    public string SportName { get; set; }
    public int LevelId { get; set; }
    public string LevelName { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
