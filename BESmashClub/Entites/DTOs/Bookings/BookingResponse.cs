namespace Entites.DTOs.Bookings;

public class BookingResponse
{
    public Guid BookingId { get; set; }
    public int CourtId { get; set; }
    public string? CourtName { get; set; }
    public string? FacilityName { get; set; }
    public string? SportName { get; set; }
    public Guid? BookedByUserId { get; set; }
    public string? BookedByUserName { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal? TotalCost { get; set; }
    public int StatusId { get; set; }
    public string? StatusName { get; set; }
    public string? PaymentUrl { get; set; }
    public DateTime? CreatedAt { get; set; }
}
