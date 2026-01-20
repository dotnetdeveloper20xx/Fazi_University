using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Notifications.Commands.UpdateNotificationPreference;

[Authorize]
public record UpdateNotificationPreferenceCommand : IRequest<Result<bool>>
{
    public string NotificationType { get; init; } = string.Empty;
    public bool EmailEnabled { get; init; }
    public bool PushEnabled { get; init; }
    public bool InAppEnabled { get; init; }
}
