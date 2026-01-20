using UniverSysLite.Domain.Common;

namespace UniverSysLite.Domain.Entities.Academic;

/// <summary>
/// Defines prerequisites for courses.
/// </summary>
public class CoursePrerequisite : BaseEntity
{
    public Guid CourseId { get; set; }
    public Guid PrerequisiteCourseId { get; set; }
    public string? MinimumGrade { get; set; } // e.g., "C"
    public bool IsConcurrent { get; set; } // Can be taken at the same time

    // Navigation Properties
    public virtual Course Course { get; set; } = null!;
    public virtual Course PrerequisiteCourse { get; set; } = null!;
}
