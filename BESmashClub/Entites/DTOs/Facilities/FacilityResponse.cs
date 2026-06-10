namespace Entites.DTOs.Facilities;

public class FacilityResponse
{
    public int FacilityId { get; set; }
    public Guid OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public string? Name { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? Address { get; set; }
    public int CourtCount { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public double? DistanceKm { get; set; }
    public DateTime? CreatedAt { get; set; }
}
