using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.UserProfiles.Commands.UpdateUserProfile;
using UniverSysLite.Application.UserProfiles.Queries.GetUserProfile;
using UniverSysLite.Application.UserPreferences.Commands.UpdateUserSettings;
using UniverSysLite.Application.UserPreferences.Queries.GetUserSettings;
using UniverSysLite.Application.Users.DTOs;
using UniverSysLite.Application.UserSessions.Commands.RevokeSession;
using UniverSysLite.Application.UserSessions.DTOs;
using UniverSysLite.Application.UserSessions.Queries.GetUserSessions;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for current user operations (profile, settings, sessions).
/// </summary>
[Authorize]
public class MeController : BaseApiController
{
    #region Profile Endpoints

    /// <summary>
    /// Get the current user's profile.
    /// </summary>
    [HttpGet("profile")]
    [ProducesResponseType(typeof(ApiResponse<UserProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetProfile()
    {
        var result = await Mediator.Send(new GetUserProfileQuery());

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse.Fail(result.Errors));
        }

        return Ok(ApiResponse<UserProfileDto>.Ok(result.Value));
    }

    /// <summary>
    /// Update the current user's profile.
    /// </summary>
    [HttpPut("profile")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse>> UpdateProfile([FromBody] UpdateUserProfileCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Profile updated successfully."));
    }

    #endregion

    #region Settings Endpoints

    /// <summary>
    /// Get the current user's settings.
    /// </summary>
    [HttpGet("settings")]
    [ProducesResponseType(typeof(ApiResponse<UserSettingsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserSettingsDto>>> GetSettings()
    {
        var result = await Mediator.Send(new GetUserSettingsQuery());

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse.Fail(result.Errors));
        }

        return Ok(ApiResponse<UserSettingsDto>.Ok(result.Value));
    }

    /// <summary>
    /// Update the current user's settings.
    /// </summary>
    [HttpPut("settings")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse>> UpdateSettings([FromBody] UpdateUserSettingsCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Settings updated successfully."));
    }

    #endregion

    #region Sessions Endpoints

    /// <summary>
    /// Get the current user's active sessions.
    /// </summary>
    [HttpGet("sessions")]
    [ProducesResponseType(typeof(ApiResponse<List<UserSessionDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<List<UserSessionDto>>>> GetSessions([FromQuery] bool includeInactive = false)
    {
        var result = await Mediator.Send(new GetUserSessionsQuery(includeInactive));

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse.Fail(result.Errors));
        }

        return Ok(ApiResponse<List<UserSessionDto>>.Ok(result.Value));
    }

    /// <summary>
    /// Revoke a specific session (logout from another device).
    /// </summary>
    [HttpDelete("sessions/{sessionId:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> RevokeSession(Guid sessionId)
    {
        var result = await Mediator.Send(new RevokeSessionCommand(sessionId));

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Session revoked successfully."));
    }

    #endregion
}
