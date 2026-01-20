using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Domain.Entities.Academic;

/// <summary>
/// Represents a specific section of a course offered in a term.
/// </summary>
public class CourseSection : BaseAuditableEntity, ISoftDelete
{
    public Guid CourseId { get; set; }
    public Guid TermId { get; set; }
    public string SectionNumber { get; set; } = string.Empty;
    public Guid? InstructorId { get; set; }
    public int MaxEnrollment { get; set; }
    public int CurrentEnrollment { get; set; }
    public int WaitlistCapacity { get; set; }
    public int WaitlistCount { get; set; }
    public string? Room { get; set; }
    public string? Building { get; set; }
    public string? Schedule { get; set; } // e.g., "MWF 9:00-10:00"
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string? DaysOfWeek { get; set; } // e.g., "MWF", "TTH"
    public bool IsOpen { get; set; } = true;
    public bool IsCancelled { get; set; }

    // Soft Delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }

    // Navigation Properties
    public virtual Course Course { get; set; } = null!;
    public virtual Term Term { get; set; } = null!;
    public virtual ApplicationUser? Instructor { get; set; }
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}
