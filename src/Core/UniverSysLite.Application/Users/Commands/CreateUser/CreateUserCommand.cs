using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Users.Commands.CreateUser;

/// <summary>
/// Command to create a new user (admin operation).
/// </summary>
[Authorize(Permission = "Users.Create")]
public record CreateUserCommand : IRequest<Result<Guid>>
{
    public string Email { get; init; } = default!;
    public string Password { get; init; } = default!;
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? PhoneNumber { get; init; }
    public bool IsActive { get; init; } = true;
    public bool EmailConfirmed { get; init; } = false;
    public bool MustChangePassword { get; init; } = true;
    public List<string> Roles { get; init; } = new();
}
