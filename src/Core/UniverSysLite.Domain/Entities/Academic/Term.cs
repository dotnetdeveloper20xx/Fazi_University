using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities.Academic;

/// <summary>
/// Represents an academic term/semester.
/// </summary>
public class Term : BaseAuditableEntity
{
    public string Code { get; set; } = string.Empty; // e.g., "2026-SPRING"
    public string Name { get; set; } = string.Empty; // e.g., "Spring 2026"
    public TermType Type { get; set; }
    public int AcademicYear { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public DateOnly RegistrationStartDate { get; set; }
    public DateOnly RegistrationEndDate { get; set; }
    public DateOnly AddDropDeadline { get; set; }
    public DateOnly WithdrawalDeadline { get; set; }
    public DateOnly GradesDeadline { get; set; }
    public bool IsCurrent { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual ICollection<CourseSection> Sections { get; set; } = new List<CourseSection>();
}
