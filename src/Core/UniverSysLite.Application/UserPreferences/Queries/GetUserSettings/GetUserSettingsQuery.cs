using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Users.DTOs;

namespace UniverSysLite.Application.UserPreferences.Queries.GetUserSettings;

/// <summary>
/// Query to get a user's settings.
/// Returns the current user's settings (users can only access their own settings).
/// </summary>
[Authorize]
public record GetUserSettingsQuery : IRequest<Result<UserSettingsDto>>;
