using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Schedules;

public class CreateScheduleRequest
{
    [Required]
    public Guid BookingId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Title { get; set; }

    [Range(1, int.MaxValue)]
    public int MaxParticipants { get; set; }

    public decimal? CostPerPerson { get; set; }

    public string CostNote { get; set; }
}
