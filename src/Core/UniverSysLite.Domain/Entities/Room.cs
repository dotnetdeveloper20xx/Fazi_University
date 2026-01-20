using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities;

public class Room : BaseAuditableEntity, ISoftDelete
{
    public Guid BuildingId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public RoomType Type { get; set; } = RoomType.Classroom;
    public int Capacity { get; set; }
    public int? Floor { get; set; }
    public string? Description { get; set; }
    public bool HasProjector { get; set; }
    public bool HasWhiteboard { get; set; }
    public bool HasComputers { get; set; }
    public int? ComputerCount { get; set; }
    public bool IsAccessible { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }

    // Navigation
    public virtual Building Building { get; set; } = null!;
    public virtual ICollection<RoomBooking> Bookings { get; set; } = new List<RoomBooking>();
}
