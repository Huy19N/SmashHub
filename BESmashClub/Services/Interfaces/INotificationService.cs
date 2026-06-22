using Entites.DTOs.Common;
using Entites.DTOs.Notifications;

namespace Services.Interfaces;

public interface INotificationService
{
    Task<PagedResult<NotificationDto>> GetUserNotificationsAsync(Guid userId, PaginationParams pagination);
    Task MarkAsReadAsync(Guid userId, Guid notificationId);
    Task MarkAllAsReadAsync(Guid userId);
    Task CreateNotificationAsync(Guid userId, string title, string content, string type, Guid? relatedId = null);
}
