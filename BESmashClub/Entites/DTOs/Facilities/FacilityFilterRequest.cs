using System;

namespace Entites.DTOs.Facilities;

public class FacilityFilterRequest
{
    public int? SportId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public double? MaxDistanceKm { get; set; }
    public DateTime? Date { get; set; }
    public string? StartTime { get; set; } // Format "HH:mm"
    public string? EndTime { get; set; }   // Format "HH:mm"
}
