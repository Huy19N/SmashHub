namespace Entites.DTOs.CourtCosts;

public class CourtCostResponse
{
    public int CourtCostId { get; set; }
    public int FacilityId { get; set; }
    public int CourtId { get; set; }
    public string? CourtName { get; set; }
    public int DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Cost { get; set; }
    public bool IsActive { get; set; }
}
