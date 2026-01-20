using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.UserSessions.DTOs;

namespace UniverSysLite.Application.UserSessions.Queries.GetUserSessions;

/// <summary>
/// Query to get the current user's active sessions.
/// </summary>
[Authorize]
public record GetUserSessionsQuery(bool IncludeInactive = false) : IRequest<Result<List<UserSessionDto>>>;
