using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities.Identity;

public class UserNotificationPreference : BaseAuditableEntity
{
    public Guid UserId { get; set; }
    public NotificationType NotificationType { get; set; }
    public bool EmailEnabled { get; set; } = true;
    public bool PushEnabled { get; set; } = true;
    public bool InAppEnabled { get; set; } = true;

    // Navigation property
    public virtual ApplicationUser User { get; set; } = null!;
}
