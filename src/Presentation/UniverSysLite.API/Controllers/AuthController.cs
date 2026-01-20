using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Identity.Commands.Login;
using UniverSysLite.Application.Identity.Commands.RefreshToken;
using UniverSysLite.Application.Identity.Commands.Register;
using UniverSysLite.Application.Identity.DTOs;
using UniverSysLite.Application.Identity.Queries.GetCurrentUser;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for authentication operations including login, registration, and token refresh.
/// </summary>
public class AuthController : BaseApiController
{
    /// <summary>
    /// Authenticates a user and returns access and refresh tokens.
    /// </summary>
    /// <param name="command">Login credentials</param>
    /// <returns>Authentication response with tokens</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthenticationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return Unauthorized(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "Authentication failed"));
        }

        return Ok(ApiResponse<AuthenticationResponse>.Ok(result.Value, "Login successful"));
    }

    /// <summary>
    /// Registers a new user account.
    /// </summary>
    /// <param name="command">Registration details</param>
    /// <returns>Success response with user ID</returns>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return CreatedAtAction(nameof(GetCurrentUser), ApiResponse<Guid>.Ok(result.Value, "Registration successful"));
    }

    /// <summary>
    /// Refreshes an expired access token using a valid refresh token.
    /// </summary>
    /// <param name="command">Refresh token request</param>
    /// <returns>New authentication tokens</returns>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthenticationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return Unauthorized(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "Token refresh failed"));
        }

        return Ok(ApiResponse<AuthenticationResponse>.Ok(result.Value, "Token refreshed successfully"));
    }

    /// <summary>
    /// Gets the current authenticated user's information.
    /// </summary>
    /// <returns>Current user details</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var result = await Mediator.Send(new GetCurrentUserQuery());

        if (!result.Succeeded)
        {
            return NotFound(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "User not found"));
        }

        return Ok(ApiResponse<UserDto>.Ok(result.Value, "User retrieved successfully"));
    }
}
