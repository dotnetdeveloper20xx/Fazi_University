using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.UserSessions.Commands.RevokeSession;

/// <summary>
/// Command to revoke (end) a user session.
/// </summary>
[Authorize]
public record RevokeSessionCommand(Guid SessionId) : IRequest<Result>;
