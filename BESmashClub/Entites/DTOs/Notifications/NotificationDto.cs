namespace Entites.DTOs.Notifications;

public class NotificationDto
{
    public Guid NotificationId { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string NotificationType { get; set; } = null!;
    public Guid? RelatedEntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTime? CreatedAt { get; set; }
}
