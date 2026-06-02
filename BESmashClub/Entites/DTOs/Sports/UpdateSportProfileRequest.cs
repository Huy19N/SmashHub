using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Sports;

public class UpdateSportProfileRequest
{
    [Required]
    public int RankValue { get; set; }
}
