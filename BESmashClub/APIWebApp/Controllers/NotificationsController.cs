using System.Security.Claims;
using Entites.DTOs.Common;
using Entites.DTOs.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[Authorize]
[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] PaginationParams pagination)
    {
        var result = await _notificationService.GetUserNotificationsAsync(GetCurrentUserId(), pagination);
        return Ok(ApiResponse<PagedResult<NotificationDto>>.SuccessResponse(result));
    }

    [HttpPatch("{notificationId:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid notificationId)
    {
        try
        {
            await _notificationService.MarkAsReadAsync(GetCurrentUserId(), notificationId);
            return Ok(ApiResponse.SuccessResponse("Đã đánh dấu đọc."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationService.MarkAllAsReadAsync(GetCurrentUserId());
        return Ok(ApiResponse.SuccessResponse("Đã đánh dấu đọc tất cả."));
    }
}
