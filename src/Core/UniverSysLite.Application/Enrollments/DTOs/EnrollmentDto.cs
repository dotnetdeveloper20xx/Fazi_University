namespace UniverSysLite.Application.Enrollments.DTOs;

/// <summary>
/// Full enrollment details DTO.
/// </summary>
public record EnrollmentDto
{
    public Guid Id { get; init; }
    public Guid StudentId { get; init; }
    public string StudentId_Display { get; init; } = string.Empty;
    public string StudentName { get; init; } = string.Empty;
    public Guid CourseSectionId { get; init; }
    public string CourseCode { get; init; } = string.Empty;
    public string CourseName { get; init; } = string.Empty;
    public string SectionNumber { get; init; } = string.Empty;
    public string TermName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime EnrollmentDate { get; init; }
    public DateTime? DropDate { get; init; }
    public DateTime? WithdrawalDate { get; init; }
    public string? Grade { get; init; }
    public decimal? GradePoints { get; init; }
    public decimal? NumericGrade { get; init; }
    public bool IsGradeFinalized { get; init; }
    public int? AttendancePercentage { get; init; }
    public string? Notes { get; init; }
    public int CreditHours { get; init; }
    public string? InstructorName { get; init; }
    public string? Schedule { get; init; }
}

/// <summary>
/// Enrollment list item DTO for paginated results.
/// </summary>
public record EnrollmentListDto
{
    public Guid Id { get; init; }
    public string StudentId_Display { get; init; } = string.Empty;
    public string StudentName { get; init; } = string.Empty;
    public string CourseCode { get; init; } = string.Empty;
    public string CourseName { get; init; } = string.Empty;
    public string SectionNumber { get; init; } = string.Empty;
    public string TermName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime EnrollmentDate { get; init; }
    public string? Grade { get; init; }
    public bool IsGradeFinalized { get; init; }
}

/// <summary>
/// Student's enrollment view with course details.
/// </summary>
public record StudentEnrollmentDto
{
    public Guid Id { get; init; }
    public Guid CourseSectionId { get; init; }
    public string CourseCode { get; init; } = string.Empty;
    public string CourseName { get; init; } = string.Empty;
    public string SectionNumber { get; init; } = string.Empty;
    public int CreditHours { get; init; }
    public string? InstructorName { get; init; }
    public string? Schedule { get; init; }
    public string? Room { get; init; }
    public string? Building { get; init; }
    public string TermName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime EnrollmentDate { get; init; }
    public string? Grade { get; init; }
    public decimal? GradePoints { get; init; }
    public bool IsGradeFinalized { get; init; }
}

/// <summary>
/// Section enrollment view with student details.
/// </summary>
public record SectionEnrollmentDto
{
    public Guid Id { get; init; }
    public Guid StudentId { get; init; }
    public string StudentId_Display { get; init; } = string.Empty;
    public string StudentName { get; init; } = string.Empty;
    public string StudentEmail { get; init; } = string.Empty;
    public string ProgramName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime EnrollmentDate { get; init; }
    public string? Grade { get; init; }
    public decimal? NumericGrade { get; init; }
    public bool IsGradeFinalized { get; init; }
    public int? AttendancePercentage { get; init; }
}
