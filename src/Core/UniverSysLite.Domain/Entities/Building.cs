using UniverSysLite.Domain.Common;

namespace UniverSysLite.Domain.Entities;

public class Building : BaseAuditableEntity, ISoftDelete
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public int? TotalFloors { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }

    // Navigation
    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}
