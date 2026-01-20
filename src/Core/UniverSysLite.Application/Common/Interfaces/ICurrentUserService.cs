namespace UniverSysLite.Application.Common.Interfaces;

/// <summary>
/// Service to access information about the currently authenticated user.
/// Implemented in the Infrastructure/API layer using HttpContext.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the current user's ID (null if not authenticated).
    /// </summary>
    Guid? UserId { get; }

    /// <summary>
    /// Gets the current user's email address.
    /// </summary>
    string? Email { get; }

    /// <summary>
    /// Gets the current user's username.
    /// </summary>
    string? UserName { get; }

    /// <summary>
    /// Gets the current user's roles.
    /// </summary>
    IEnumerable<string> Roles { get; }

    /// <summary>
    /// Gets the current user's permissions.
    /// </summary>
    IEnumerable<string> Permissions { get; }

    /// <summary>
    /// Checks if the current user is authenticated.
    /// </summary>
    bool IsAuthenticated { get; }

    /// <summary>
    /// Checks if the current user has a specific role.
    /// </summary>
    bool IsInRole(string role);

    /// <summary>
    /// Checks if the current user has a specific permission.
    /// </summary>
    bool HasPermission(string permission);

    /// <summary>
    /// Gets the client IP address.
    /// </summary>
    string? IpAddress { get; }

    /// <summary>
    /// Gets the client user agent.
    /// </summary>
    string? UserAgent { get; }

    /// <summary>
    /// Gets the current session ID.
    /// </summary>
    Guid? SessionId { get; }
}
