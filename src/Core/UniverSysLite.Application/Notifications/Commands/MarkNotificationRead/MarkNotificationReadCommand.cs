using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Notifications.Commands.MarkNotificationRead;

[Authorize]
public record MarkNotificationReadCommand : IRequest<Result<bool>>
{
    public Guid NotificationId { get; init; }
}
