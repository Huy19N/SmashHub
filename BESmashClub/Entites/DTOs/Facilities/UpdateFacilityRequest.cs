using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Facilities;

public class UpdateFacilityRequest
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(50)]
    public string? City { get; set; }

    [MaxLength(50)]
    public string? District { get; set; }

    [MaxLength(255)]
    public string? Address { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }
}
