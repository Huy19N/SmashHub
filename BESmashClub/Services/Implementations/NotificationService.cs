using Entites.DTOs.Common;
using Entites.DTOs.Notifications;
using Entites.Models;
using Microsoft.AspNetCore.SignalR;
using Repositories;
using Services.Hubs;
using Services.Interfaces;

namespace Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(UnitOfWork unitOfWork, IHubContext<NotificationHub> hubContext)
    {
        _unitOfWork = unitOfWork;
        _hubContext = hubContext;
    }

    public async Task<PagedResult<NotificationDto>> GetUserNotificationsAsync(Guid userId, PaginationParams pagination)
    {
        var (items, totalCount) = await _unitOfWork.Notifications.GetPagedAsync(
            n => n.UserId == userId,
            pagination.PageNumber,
            pagination.PageSize,
            query => query.OrderByDescending(n => n.CreatedAt)
        );

        return new PagedResult<NotificationDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task MarkAsReadAsync(Guid userId, Guid notificationId)
    {
        var notification = await _unitOfWork.Notifications.GetByIdAsync(notificationId);
        if (notification == null || notification.UserId != userId)
            throw new KeyNotFoundException("Không tìm thấy thông báo.");

        notification.IsRead = true;
        await _unitOfWork.Notifications.UpdateAsync(notification);
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var unread = await _unitOfWork.Notifications.FindAsync(n => n.UserId == userId && !n.IsRead);
        foreach (var n in unread)
        {
            n.IsRead = true;
        }

        if (unread.Any())
        {
            var context = _unitOfWork.Notifications.GetContext();
            context.UpdateRange(unread);
            await context.SaveChangesAsync();
        }
    }

    public async Task CreateNotificationAsync(Guid userId, string title, string content, string type, Guid? relatedId = null)
    {
        var notification = new Notification
        {
            NotificationId = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Content = content,
            NotificationType = type,
            RelatedEntityId = relatedId,
            IsRead = false,
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.Notifications.CreateAsync(notification);

        var dto = MapToDto(notification);

        // SignalR Push
        // Send to specific User by UserId if mapping is configured, or we can broadcast if needed.
        // Assuming UserId maps to SignalR UserIdentifier
        await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", dto);
    }

    private static NotificationDto MapToDto(Notification n)
    {
        return new NotificationDto
        {
            NotificationId = n.NotificationId,
            UserId = n.UserId,
            Title = n.Title,
            Content = n.Content,
            NotificationType = n.NotificationType,
            RelatedEntityId = n.RelatedEntityId,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        };
    }
}
