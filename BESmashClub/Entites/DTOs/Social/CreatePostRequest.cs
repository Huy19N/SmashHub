using System.ComponentModel.DataAnnotations;

namespace Entites.DTOs.Social;

public class CreatePostRequest
{
    public int? FacilityId { get; set; }
    
    public Guid? TeamId { get; set; }

    [Required]
    public int PostType { get; set; }

    [Required]
    public string Content { get; set; } = null!;

    public Guid? MediaFileId { get; set; }
}
