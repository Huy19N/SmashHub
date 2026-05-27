using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Schedules;

public class CreateScheduleRequest
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; }

    [Required]
    public int SportId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Location { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    [Range(1, int.MaxValue)]
    public int MaxParticipants { get; set; }

    public decimal? TotalCost { get; set; }

    public string CostNote { get; set; }
}
