using MediatR;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.Application.Identity.Commands.Register;

/// <summary>
/// Command to register a new user.
/// </summary>
public record RegisterCommand : IRequest<Result<Guid>>
{
    public string Email { get; init; } = default!;
    public string Password { get; init; } = default!;
    public string ConfirmPassword { get; init; } = default!;
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? PhoneNumber { get; init; }
}
