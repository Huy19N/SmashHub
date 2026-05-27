using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Schedules;

public class UpdateScheduleRequest
{
    [MaxLength(255)]
    public string Title { get; set; }

    [MaxLength(255)]
    public string Location { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public int? MaxParticipants { get; set; }

    public decimal? TotalCost { get; set; }

    public string CostNote { get; set; }
}
