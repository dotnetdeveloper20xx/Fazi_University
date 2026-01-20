using UniverSysLite.Domain.Common;

namespace UniverSysLite.Domain.Entities.Identity;

public class Permission : BaseEntity
{
    public string Name { get; set; } = string.Empty;         // "Students.Create"
    public string DisplayName { get; set; } = string.Empty;  // "Create Students"
    public string? Description { get; set; }
    public string Module { get; set; } = string.Empty;       // "Students"
    public string Action { get; set; } = string.Empty;       // "Create"
    public bool IsSystem { get; set; } = true;               // Cannot be deleted

    // Navigation properties
    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
