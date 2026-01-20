using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Identity.DTOs;

namespace UniverSysLite.Application.Identity.Commands.RefreshToken;

/// <summary>
/// Command to refresh an expired access token using a valid refresh token.
/// </summary>
public record RefreshTokenCommand : IRequest<Result<AuthenticationResponse>>
{
    public string AccessToken { get; init; } = default!;
    public string RefreshToken { get; init; } = default!;
}
