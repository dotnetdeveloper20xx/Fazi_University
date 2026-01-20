namespace UniverSysLite.Application.Grades.DTOs;

/// <summary>
/// Grade information DTO.
/// </summary>
public record GradeDto
{
    public Guid EnrollmentId { get; init; }
    public string CourseCode { get; init; } = string.Empty;
    public string CourseName { get; init; } = string.Empty;
    public string SectionNumber { get; init; } = string.Empty;
    public int CreditHours { get; init; }
    public string TermName { get; init; } = string.Empty;
    public string? Grade { get; init; }
    public decimal? GradePoints { get; init; }
    public decimal? NumericGrade { get; init; }
    public bool IsGradeFinalized { get; init; }
    public DateTime? GradeSubmittedAt { get; init; }
    public string? GradeSubmittedBy { get; init; }
}

/// <summary>
/// Student transcript DTO.
/// </summary>
public record TranscriptDto
{
    public Guid StudentId { get; init; }
    public string StudentId_Display { get; init; } = string.Empty;
    public string StudentName { get; init; } = string.Empty;
    public string ProgramName { get; init; } = string.Empty;
    public decimal CumulativeGpa { get; init; }
    public int TotalCreditsAttempted { get; init; }
    public int TotalCreditsEarned { get; init; }
    public decimal TotalGradePoints { get; init; }
    public List<TranscriptTermDto> Terms { get; init; } = new();
}

/// <summary>
/// Transcript term details.
/// </summary>
public record TranscriptTermDto
{
    public Guid TermId { get; init; }
    public string TermName { get; init; } = string.Empty;
    public decimal TermGpa { get; init; }
    public int CreditsAttempted { get; init; }
    public int CreditsEarned { get; init; }
    public List<TranscriptCourseDto> Courses { get; init; } = new();
}

/// <summary>
/// Transcript course details.
/// </summary>
public record TranscriptCourseDto
{
    public string CourseCode { get; init; } = string.Empty;
    public string CourseName { get; init; } = string.Empty;
    public int CreditHours { get; init; }
    public string? Grade { get; init; }
    public decimal? GradePoints { get; init; }
    public decimal? QualityPoints { get; init; }
}

/// <summary>
/// GPA Summary DTO.
/// </summary>
public record GpaSummaryDto
{
    public Guid StudentId { get; init; }
    public string StudentId_Display { get; init; } = string.Empty;
    public string StudentName { get; init; } = string.Empty;
    public decimal CumulativeGpa { get; init; }
    public int TotalCreditsAttempted { get; init; }
    public int TotalCreditsEarned { get; init; }
    public decimal? CurrentTermGpa { get; init; }
    public int? CurrentTermCredits { get; init; }
    public string AcademicStanding { get; init; } = string.Empty;
}
