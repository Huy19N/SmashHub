namespace Entites.DTOs.Social;

public class PostDto
{
    public Guid PostId { get; set; }
    public Guid AuthorUserId { get; set; }
    public string AuthorName { get; set; } = null!;
    public Guid? AuthorAvatarId { get; set; }
    public int? FacilityId { get; set; }
    public string? FacilityName { get; set; }
    public Guid? TeamId { get; set; }
    public string? TeamName { get; set; }
    public int PostType { get; set; }
    public string Content { get; set; } = null!;
    public Guid? MediaFileId { get; set; }
    public string? MediaUrl { get; set; }
    public List<Guid> MediaFileIds { get; set; } = new List<Guid>();
    public bool IsBoosted { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public bool IsLikedByCurrentUser { get; set; }
}
