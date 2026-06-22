using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.CourtCosts;

public class BulkCourtCostRequest
{
    [Required]
    public List<int> DaysOfWeek { get; set; } = new List<int>();

    [Required]
    public TimeOnly StartTime { get; set; }

    [Required]
    public TimeOnly EndTime { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "DurationMinutes phải lớn hơn 0.")]
    public int DurationMinutes { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Cost phải lớn hơn 0.")]
    public decimal Cost { get; set; }
}
