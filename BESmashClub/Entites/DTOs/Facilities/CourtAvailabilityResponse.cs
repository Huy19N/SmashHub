using System;
using System.Collections.Generic;

namespace Entites.DTOs.Facilities;

public class CourtAvailabilityResponse
{
    public int CourtId { get; set; }
    public string CourtName { get; set; }
    public string SportName { get; set; }
    public bool IsActive { get; set; }
    public List<TimeSlotStatus> TimeSlots { get; set; } = new();
}

public class TimeSlotStatus
{
    public string StartTime { get; set; } // "HH:mm"
    public string EndTime { get; set; }   // "HH:mm"
    public decimal Cost { get; set; }
    public string Status { get; set; } // "Available", "Booked", "Maintenance"
    public Guid? BookingId { get; set; }
    public string BookedByUserName { get; set; }
}
