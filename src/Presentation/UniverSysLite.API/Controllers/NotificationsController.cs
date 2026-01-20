using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Notifications.Commands.DeleteNotification;
using UniverSysLite.Application.Notifications.Commands.MarkAllNotificationsRead;
using UniverSysLite.Application.Notifications.Commands.MarkNotificationRead;
using UniverSysLite.Application.Notifications.Commands.SendNotification;
using UniverSysLite.Application.Notifications.Commands.UpdateNotificationPreference;
using UniverSysLite.Application.Notifications.DTOs;
using UniverSysLite.Application.Notifications.Queries.GetNotificationPreferences;
using UniverSysLite.Application.Notifications.Queries.GetNotificationSummary;
using UniverSysLite.Application.Notifications.Queries.GetUserNotifications;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for managing notifications.
/// </summary>
[Authorize]
public class NotificationsController : BaseApiController
{
    /// <summary>
    /// Get notifications for the current user.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<NotificationListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotifications([FromQuery] GetUserNotificationsQuery query)
    {
        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<PaginatedList<NotificationListDto>>.Ok(result.Value, "Notifications retrieved successfully"));
    }

    /// <summary>
    /// Get notification summary (counts and recent notifications).
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<NotificationSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotificationSummary([FromQuery] int recentCount = 5)
    {
        var query = new GetNotificationSummaryQuery { RecentCount = recentCount };
        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<NotificationSummaryDto>.Ok(result.Value, "Notification summary retrieved successfully"));
    }

    /// <summary>
    /// Send a notification to a user (admin only).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SendNotification([FromBody] SendNotificationCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<Guid>.Ok(result.Value, "Notification sent successfully"));
    }

    /// <summary>
    /// Mark a notification as read.
    /// </summary>
    [HttpPut("{id}/read")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var command = new MarkNotificationReadCommand { NotificationId = id };
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<string>.Ok("Marked as read", "Notification marked as read"));
    }

    /// <summary>
    /// Mark all notifications as read.
    /// </summary>
    [HttpPut("read-all")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var result = await Mediator.Send(new MarkAllNotificationsReadCommand());

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<int>.Ok(result.Value, $"{result.Value} notifications marked as read"));
    }

    /// <summary>
    /// Delete (archive) a notification.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteNotification(Guid id)
    {
        var command = new DeleteNotificationCommand { NotificationId = id };
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<string>.Ok("Deleted", "Notification deleted successfully"));
    }

    /// <summary>
    /// Get notification preferences for the current user.
    /// </summary>
    [HttpGet("preferences")]
    [ProducesResponseType(typeof(ApiResponse<List<NotificationPreferenceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPreferences()
    {
        var result = await Mediator.Send(new GetNotificationPreferencesQuery());

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<List<NotificationPreferenceDto>>.Ok(result.Value, "Preferences retrieved successfully"));
    }

    /// <summary>
    /// Update a notification preference.
    /// </summary>
    [HttpPut("preferences")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdatePreference([FromBody] UpdateNotificationPreferenceCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<string>.Ok("Updated", "Preference updated successfully"));
    }
}
