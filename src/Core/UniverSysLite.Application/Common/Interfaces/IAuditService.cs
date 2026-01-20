using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Common.Interfaces;

/// <summary>
/// Service for creating audit log entries.
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Creates an audit log entry.
    /// </summary>
    Task LogAsync(
        AuditAction action,
        string entityType,
        string? entityId,
        string? description = null,
        object? oldValues = null,
        object? newValues = null,
        AuditSeverity severity = AuditSeverity.Info,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a successful login.
    /// </summary>
    Task LogLoginAsync(Guid userId, string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a failed login attempt.
    /// </summary>
    Task LogFailedLoginAsync(string email, string reason, CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a logout.
    /// </summary>
    Task LogLogoutAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a permission denied event.
    /// </summary>
    Task LogPermissionDeniedAsync(string resource, string action, CancellationToken cancellationToken = default);
}
