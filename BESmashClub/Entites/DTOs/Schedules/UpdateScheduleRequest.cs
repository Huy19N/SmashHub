using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Schedules;

public class UpdateScheduleRequest
{
    [MaxLength(255)]
    public string Title { get; set; }

    public int? MaxParticipants { get; set; }

    public decimal? CostPerPerson { get; set; }

    public string CostNote { get; set; }
}
