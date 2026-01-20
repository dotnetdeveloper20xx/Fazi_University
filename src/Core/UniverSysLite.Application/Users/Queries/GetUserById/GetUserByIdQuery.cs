using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Users.DTOs;

namespace UniverSysLite.Application.Users.Queries.GetUserById;

/// <summary>
/// Query to get detailed user information by ID.
/// </summary>
[Authorize(Permission = "Users.View")]
public record GetUserByIdQuery(Guid UserId) : IRequest<Result<UserDetailDto>>;
