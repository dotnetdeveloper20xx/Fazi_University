using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities.Identity;

public class UserProfile : BaseAuditableEntity
{
    public Guid UserId { get; set; }

    public string? AvatarUrl { get; set; }
    public string? AvatarThumbnailUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Bio { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string? Location { get; set; }

    public ProfileVisibility Visibility { get; set; } = ProfileVisibility.Internal;

    // Navigation property
    public virtual ApplicationUser User { get; set; } = null!;
}
