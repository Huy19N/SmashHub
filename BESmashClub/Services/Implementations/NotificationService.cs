using Entites.DTOs.Common;
using Entites.DTOs.Notifications;
using Entites.Mongo;
using Microsoft.AspNetCore.SignalR;
using Repositories.Mongo;
using Services.Hubs;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;

namespace Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(INotificationRepository notificationRepository, IHubContext<NotificationHub> hubContext)
    {
        _notificationRepository = notificationRepository;
        _hubContext = hubContext;
    }

    public async Task<PagedResult<NotificationDto>> GetUserNotificationsAsync(Guid userId, PaginationParams pagination)
    {
        var filter = Builders<Notification>.Filter.Eq(n => n.UserId, userId.ToString());
        var items = await _notificationRepository.FindAsync(filter);

        var pagedItems = items.OrderByDescending(n => n.CreatedAt)
                              .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                              .Take(pagination.PageSize)
                              .ToList();

        return new PagedResult<NotificationDto>
        {
            Items = pagedItems.Select(MapToDto).ToList(),
            TotalCount = items.Count,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }

    public async Task MarkAsReadAsync(Guid userId, Guid notificationId)
    {
        var notification = await _notificationRepository.GetByIdAsync(notificationId.ToString());
        if (notification == null || notification.UserId != userId.ToString())
            throw new KeyNotFoundException("Không tìm thấy thông báo.");

        notification.IsRead = true;
        await _notificationRepository.UpdateAsync(notification.Id, notification);
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var filter = Builders<Notification>.Filter.And(
            Builders<Notification>.Filter.Eq(n => n.UserId, userId.ToString()),
            Builders<Notification>.Filter.Eq(n => n.IsRead, false)
        );

        var unread = await _notificationRepository.FindAsync(filter);
        foreach (var n in unread)
        {
            n.IsRead = true;
            await _notificationRepository.UpdateAsync(n.Id, n);
        }
    }

    public async Task CreateNotificationAsync(Guid userId, string title, string content, string type, Guid? relatedId = null)
    {
        var notification = new Notification
        {
            UserId = userId.ToString(),
            Title = title,
            Content = content,
            NotificationType = type,
            RelatedEntityId = relatedId?.ToString(),
            IsRead = false,
            CreatedAt = DateTime.Now
        };

        await _notificationRepository.CreateAsync(notification);

        var dto = MapToDto(notification);

        // SignalR Push
        await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", dto);
    }

    private static NotificationDto MapToDto(Notification n)
    {
        return new NotificationDto
        {
            NotificationId = Guid.TryParse(n.Id, out var parsedId) ? parsedId : Guid.Empty, // MongoDB uses string ObjectId, but DTO might still have Guid.
            UserId = Guid.Parse(n.UserId),
            Title = n.Title,
            Content = n.Content,
            NotificationType = n.NotificationType,
            RelatedEntityId = n.RelatedEntityId != null ? Guid.Parse(n.RelatedEntityId) : null,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        };
    }
}
