using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Users.Commands.DeleteUser;

/// <summary>
/// Command to delete (deactivate) a user.
/// </summary>
[Authorize(Permission = "Users.Delete")]
public record DeleteUserCommand(Guid UserId) : IRequest<Result>;
