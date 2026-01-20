using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Notifications.Commands.MarkAllNotificationsRead;

[Authorize]
public record MarkAllNotificationsReadCommand : IRequest<Result<int>>
{
}
