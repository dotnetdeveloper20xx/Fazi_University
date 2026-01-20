using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Notifications.DTOs;

namespace UniverSysLite.Application.Notifications.Queries.GetUserNotifications;

[Authorize]
public record GetUserNotificationsQuery : IRequest<Result<PaginatedList<NotificationListDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public bool? IsRead { get; init; }
    public string? Type { get; init; }
    public bool IncludeArchived { get; init; } = false;
}
