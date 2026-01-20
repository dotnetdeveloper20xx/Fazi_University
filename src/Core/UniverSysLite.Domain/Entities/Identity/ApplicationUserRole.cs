using Microsoft.AspNetCore.Identity;

namespace UniverSysLite.Domain.Entities.Identity;

public class ApplicationUserRole : IdentityUserRole<Guid>
{
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual ApplicationRole Role { get; set; } = null!;
}
