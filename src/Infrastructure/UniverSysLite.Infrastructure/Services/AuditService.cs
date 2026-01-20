using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;
using UniverSysLite.Infrastructure.Persistence;

namespace UniverSysLite.Infrastructure.Services;

/// <summary>
/// Financial-grade audit logging service with tamper detection via hash chain.
/// </summary>
public class AuditService : IAuditService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTimeService _dateTimeService;

    public AuditService(
        ApplicationDbContext context,
        ICurrentUserService currentUserService,
        IDateTimeService dateTimeService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _dateTimeService = dateTimeService;
    }

    public async Task LogAsync(
        AuditAction action,
        string entityType,
        string? entityId,
        string? description = null,
        object? oldValues = null,
        object? newValues = null,
        AuditSeverity severity = AuditSeverity.Info,
        CancellationToken cancellationToken = default)
    {
        // Get the previous audit log hash for chain verification
        var previousHash = await _context.AuditLogs
            .OrderByDescending(a => a.Timestamp)
            .Select(a => a.Hash)
            .FirstOrDefaultAsync(cancellationToken);

        var auditLog = new AuditLog
        {
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            ChangesSummary = description,
            OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
            NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
            UserId = _currentUserService.UserId,
            UserName = _currentUserService.UserName,
            UserEmail = _currentUserService.Email,
            IpAddress = _currentUserService.IpAddress,
            UserAgent = _currentUserService.UserAgent,
            SessionId = _currentUserService.SessionId,
            Severity = severity,
            Timestamp = _dateTimeService.UtcNow,
            CorrelationId = GetCorrelationId(),
            PreviousHash = previousHash
        };

        // Generate hash for tamper detection
        auditLog.Hash = GenerateHash(auditLog);

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task LogLoginAsync(Guid userId, string email, CancellationToken cancellationToken = default)
    {
        await LogAsync(
            AuditAction.Login,
            "User",
            userId.ToString(),
            $"User {email} logged in successfully",
            severity: AuditSeverity.Info,
            cancellationToken: cancellationToken);
    }

    public async Task LogFailedLoginAsync(string email, string reason, CancellationToken cancellationToken = default)
    {
        await LogAsync(
            AuditAction.LoginFailed,
            "User",
            null,
            $"Failed login attempt for {email}: {reason}",
            severity: AuditSeverity.Warning,
            cancellationToken: cancellationToken);
    }

    public async Task LogLogoutAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await LogAsync(
            AuditAction.Logout,
            "User",
            userId.ToString(),
            "User logged out",
            severity: AuditSeverity.Info,
            cancellationToken: cancellationToken);
    }

    public async Task LogPermissionDeniedAsync(string resource, string action, CancellationToken cancellationToken = default)
    {
        await LogAsync(
            AuditAction.AccessDenied,
            resource,
            null,
            $"Permission denied for action: {action}",
            severity: AuditSeverity.Warning,
            cancellationToken: cancellationToken);
    }

    private string? GetCorrelationId()
    {
        // In a real application, this would come from a correlation ID middleware
        return Guid.NewGuid().ToString();
    }

    private static string GenerateHash(AuditLog auditLog)
    {
        var data = $"{auditLog.Action}|{auditLog.EntityType}|{auditLog.EntityId}|{auditLog.UserId}|{auditLog.Timestamp:O}|{auditLog.PreviousHash}";
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(data));
        return Convert.ToBase64String(bytes);
    }
}
