using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Identity.DTOs;

namespace UniverSysLite.Application.Identity.Commands.Login;

/// <summary>
/// Command to authenticate a user with email and password.
/// </summary>
public record LoginCommand : IRequest<Result<AuthenticationResponse>>
{
    public string Email { get; init; } = default!;
    public string Password { get; init; } = default!;
    public bool RememberMe { get; init; }
}
