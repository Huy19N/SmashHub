namespace Entites.DTOs.Schedules;

public class ScheduleResponse
{
    public Guid ScheduleId { get; set; }
    public Guid HostTeamId { get; set; }
    public string HostTeamName { get; set; }
    public string Title { get; set; }
    public int SportId { get; set; }
    public string SportName { get; set; }
    public string Location { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int MaxParticipants { get; set; }
    public int CurrentParticipants { get; set; }
    public decimal? TotalCost { get; set; }
    public string CostNote { get; set; }
    public DateTime? CreatedAt { get; set; }
}
