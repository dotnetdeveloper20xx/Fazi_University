using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Identity.DTOs;

namespace UniverSysLite.Application.Identity.Queries.GetCurrentUser;

/// <summary>
/// Query to get the currently authenticated user's information.
/// </summary>
[Authorize]
public record GetCurrentUserQuery : IRequest<Result<UserDto>>;
