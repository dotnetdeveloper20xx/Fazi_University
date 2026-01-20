using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Application.Common.Interfaces;

/// <summary>
/// Service for generating and validating JWT tokens.
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Generates an access token for the specified user.
    /// </summary>
    /// <param name="user">The user to generate the token for.</param>
    /// <param name="roles">The user's roles.</param>
    /// <param name="permissions">The user's permissions.</param>
    /// <returns>The generated JWT access token.</returns>
    Task<string> GenerateAccessTokenAsync(ApplicationUser user, IEnumerable<string> roles, IEnumerable<string> permissions);

    /// <summary>
    /// Generates a refresh token.
    /// </summary>
    /// <returns>A new refresh token string.</returns>
    string GenerateRefreshToken();

    /// <summary>
    /// Validates an access token and returns the principal if valid.
    /// </summary>
    /// <param name="token">The token to validate.</param>
    /// <returns>The user ID if the token is valid, null otherwise.</returns>
    Guid? ValidateAccessToken(string token);

    /// <summary>
    /// Gets the user ID from an expired token (for refresh token flow).
    /// </summary>
    /// <param name="token">The expired token.</param>
    /// <returns>The user ID from the token claims.</returns>
    Guid? GetUserIdFromExpiredToken(string token);
}
