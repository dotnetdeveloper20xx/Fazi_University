using UniverSysLite.Domain.Common;

namespace UniverSysLite.Domain.Entities.Identity;

public class PasswordHistory : BaseEntity
{
    public Guid UserId { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual ApplicationUser User { get; set; } = null!;
}
