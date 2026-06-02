using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Bookings;

public class CreateBookingRequest
{
    [Required]
    public int CourtId { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }
}
