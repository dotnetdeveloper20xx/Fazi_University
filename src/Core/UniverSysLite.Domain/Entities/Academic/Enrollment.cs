using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities.Academic;

/// <summary>
/// Represents a student's enrollment in a course section.
/// </summary>
public class Enrollment : BaseAuditableEntity
{
    public Guid StudentId { get; set; }
    public Guid CourseSectionId { get; set; }
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Enrolled;
    public DateTime EnrollmentDate { get; set; }
    public DateTime? DropDate { get; set; }
    public DateTime? WithdrawalDate { get; set; }

    // Grade Information
    public string? Grade { get; set; } // A, B, C, D, F, W, I, P, NP
    public decimal? GradePoints { get; set; }
    public decimal? NumericGrade { get; set; } // 0-100
    public DateTime? GradeSubmittedAt { get; set; }
    public Guid? GradeSubmittedById { get; set; }
    public bool IsGradeFinalized { get; set; }

    // Attendance
    public int? AttendancePercentage { get; set; }

    // Notes
    public string? Notes { get; set; }

    // Navigation Properties
    public virtual Student Student { get; set; } = null!;
    public virtual CourseSection CourseSection { get; set; } = null!;
}
