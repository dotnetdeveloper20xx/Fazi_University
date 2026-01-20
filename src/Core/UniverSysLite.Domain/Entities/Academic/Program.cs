using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities.Academic;

/// <summary>
/// Represents an academic program (e.g., BS Computer Science, MBA).
/// </summary>
public class Program : BaseAuditableEntity, ISoftDelete
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DegreeType DegreeType { get; set; }
    public Guid DepartmentId { get; set; }
    public int TotalCreditsRequired { get; set; }
    public int DurationYears { get; set; }
    public decimal TuitionPerCredit { get; set; }
    public bool IsActive { get; set; } = true;

    // Soft Delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }

    // Navigation Properties
    public virtual Department Department { get; set; } = null!;
    public virtual ICollection<Student> Students { get; set; } = new List<Student>();
    public virtual ICollection<ProgramCourse> ProgramCourses { get; set; } = new List<ProgramCourse>();
}
