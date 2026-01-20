using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Notifications.DTOs;

namespace UniverSysLite.Application.Notifications.Queries.GetNotificationSummary;

[Authorize]
public record GetNotificationSummaryQuery : IRequest<Result<NotificationSummaryDto>>
{
    public int RecentCount { get; init; } = 5;
}
