using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Facilities;

public class CreateFacilityRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string City { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string District { get; set; } = null!;

    [MaxLength(255)]
    public string? Address { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    [MaxLength(100)]
    public string? BusinessCode { get; set; }
}
