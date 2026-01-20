using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Notifications.Commands.DeleteNotification;

[Authorize]
public record DeleteNotificationCommand : IRequest<Result<bool>>
{
    public Guid NotificationId { get; init; }
}
