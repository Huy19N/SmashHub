using System.Collections.Generic;

namespace Entites.DTOs.Bookings;

public class BatchBookingResponse
{
    public List<BookingResponse> Bookings { get; set; } = new();
    public string? PaymentUrl { get; set; }
}
