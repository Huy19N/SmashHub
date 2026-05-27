using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Teams;

public class UpdateTeamRequest
{
    [MaxLength(255)]
    public string TeamName { get; set; }

    public string Description { get; set; }
}
