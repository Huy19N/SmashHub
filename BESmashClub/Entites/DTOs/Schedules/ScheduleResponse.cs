namespace Entites.DTOs.Schedules;

public class ScheduleResponse
{
    public Guid ScheduleId { get; set; }
    public Guid HostTeamId { get; set; }
    public string HostTeamName { get; set; }
    public Guid BookingId { get; set; }
    public string Title { get; set; }

    // From Booking
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal? BookingTotalCost { get; set; }

    // From Booking -> Court -> Facility
    public string CourtName { get; set; }
    public string FacilityName { get; set; }
    public string SportName { get; set; }

    public int MaxParticipants { get; set; }
    public int CurrentParticipants { get; set; }
    public decimal? CostPerPerson { get; set; }
    public string CostNote { get; set; }
    public DateTime? CreatedAt { get; set; }
}
