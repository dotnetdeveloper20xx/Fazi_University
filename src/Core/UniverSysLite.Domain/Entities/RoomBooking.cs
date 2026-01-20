using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities;

public class RoomBooking : BaseAuditableEntity
{
    public Guid RoomId { get; set; }
    public Guid? CourseSectionId { get; set; }
    public Guid? BookedById { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BookingType BookingType { get; set; } = BookingType.Class;
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; } // JSON: days of week, frequency
    public DateOnly? RecurrenceEndDate { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    public string? CancellationReason { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Navigation
    public virtual Room Room { get; set; } = null!;
    public virtual CourseSection? CourseSection { get; set; }
    public virtual ApplicationUser? BookedBy { get; set; }
}
