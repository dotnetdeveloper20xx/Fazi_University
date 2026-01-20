using UniverSysLite.Domain.Common;

namespace UniverSysLite.Domain.Entities.Identity;

public class UserSession : BaseEntity
{
    public Guid UserId { get; set; }

    public string DeviceInfo { get; set; } = string.Empty;
    public string Browser { get; set; } = string.Empty;
    public string OperatingSystem { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string? Location { get; set; }

    public DateTime LoginAt { get; set; } = DateTime.UtcNow;
    public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;
    public DateTime? LogoutAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation property
    public virtual ApplicationUser User { get; set; } = null!;
}
