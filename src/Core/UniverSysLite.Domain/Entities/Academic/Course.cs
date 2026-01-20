using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities.Academic;

/// <summary>
/// Represents a course offered by the university.
/// </summary>
public class Course : BaseAuditableEntity, ISoftDelete
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid DepartmentId { get; set; }
    public int CreditHours { get; set; }
    public int LectureHours { get; set; }
    public int LabHours { get; set; }
    public CourseLevel Level { get; set; } = CourseLevel.Undergraduate;
    public bool IsActive { get; set; } = true;

    // Soft Delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }

    // Navigation Properties
    public virtual Department Department { get; set; } = null!;
    public virtual ICollection<CourseSection> Sections { get; set; } = new List<CourseSection>();
    public virtual ICollection<ProgramCourse> ProgramCourses { get; set; } = new List<ProgramCourse>();
    public virtual ICollection<CoursePrerequisite> Prerequisites { get; set; } = new List<CoursePrerequisite>();
}
