namespace Entites.DTOs.Social;

public class CommentDto
{
    public Guid CommentId { get; set; }
    public Guid PostId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = null!;
    public Guid? UserAvatarId { get; set; }
    public string Content { get; set; } = null!;
    public DateTime? CreatedAt { get; set; }
}
