using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities.Identity;

public class AuditLog
{
    public long Id { get; set; }
    public Guid AuditId { get; set; } = Guid.NewGuid();

    // Who
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public Guid? ImpersonatedById { get; set; }

    // What
    public AuditAction Action { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? EntityName { get; set; }

    // Changes
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? ChangedColumns { get; set; }
    public string? ChangesSummary { get; set; }

    // Context
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public Guid? SessionId { get; set; }
    public string? CorrelationId { get; set; }
    public string? RequestPath { get; set; }
    public string? RequestMethod { get; set; }

    // Timing
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public long? DurationMs { get; set; }

    // Additional
    public string? AdditionalData { get; set; }
    public AuditSeverity Severity { get; set; } = AuditSeverity.Info;
    public string? ErrorMessage { get; set; }

    // Integrity
    public string? PreviousHash { get; set; }
    public string Hash { get; set; } = string.Empty;
}
