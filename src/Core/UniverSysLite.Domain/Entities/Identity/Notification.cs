using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities.Identity;

public class Notification : BaseAuditableEntity
{
    public Guid UserId { get; set; }

    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public string? ActionText { get; set; }
    public string? Icon { get; set; }

    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    public bool IsArchived { get; set; } = false;
    public DateTime? ArchivedAt { get; set; }

    public DateTime? ExpiresAt { get; set; }
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;

    // Reference to source entity
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }

    // Navigation property
    public virtual ApplicationUser User { get; set; } = null!;

    public void MarkAsRead()
    {
        IsRead = true;
        ReadAt = DateTime.UtcNow;
    }

    public void Archive()
    {
        IsArchived = true;
        ArchivedAt = DateTime.UtcNow;
    }
}
