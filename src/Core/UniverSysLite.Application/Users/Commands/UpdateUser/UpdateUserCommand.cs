using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Users.Commands.UpdateUser;

/// <summary>
/// Command to update a user's basic information.
/// </summary>
[Authorize(Permission = "Users.Edit")]
public record UpdateUserCommand : IRequest<Result>
{
    public Guid UserId { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? DisplayName { get; init; }
    public string? PhoneNumber { get; init; }
    public bool? IsActive { get; init; }
    public bool? EmailConfirmed { get; init; }
    public bool? MustChangePassword { get; init; }
    public List<string>? Roles { get; init; }
}
