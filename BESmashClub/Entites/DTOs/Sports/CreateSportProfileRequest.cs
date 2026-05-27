using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Sports;

public class CreateSportProfileRequest
{
    [Required]
    public int SportId { get; set; }

    [Required]
    public int LevelId { get; set; }
}
