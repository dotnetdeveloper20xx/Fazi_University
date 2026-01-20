using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Notifications.DTOs;

namespace UniverSysLite.Application.Notifications.Queries.GetNotificationPreferences;

[Authorize]
public record GetNotificationPreferencesQuery : IRequest<Result<List<NotificationPreferenceDto>>>
{
}
