namespace UniverSysLite.Application.Reports.DTOs;

public record EnrollmentStatisticsDto
{
    public int TotalEnrollments { get; init; }
    public int ActiveEnrollments { get; init; }
    public int DroppedEnrollments { get; init; }
    public int WithdrawnEnrollments { get; init; }
    public int CompletedEnrollments { get; init; }
    public int WaitlistedStudents { get; init; }
    public decimal AverageEnrollmentsPerStudent { get; init; }
    public decimal AverageEnrollmentsPerSection { get; init; }
    public List<EnrollmentByTermDto> EnrollmentsByTerm { get; init; } = new();
    public List<EnrollmentByDepartmentDto> EnrollmentsByDepartment { get; init; } = new();
}

public record EnrollmentByTermDto
{
    public Guid TermId { get; init; }
    public string TermName { get; init; } = string.Empty;
    public int TotalEnrollments { get; init; }
    public int UniqueStudents { get; init; }
}

public record EnrollmentByDepartmentDto
{
    public Guid DepartmentId { get; init; }
    public string DepartmentName { get; init; } = string.Empty;
    public int TotalEnrollments { get; init; }
    public int TotalSections { get; init; }
}

public record GradeDistributionDto
{
    public Guid? TermId { get; init; }
    public string? TermName { get; init; }
    public Guid? CourseId { get; init; }
    public string? CourseName { get; init; }
    public int TotalGrades { get; init; }
    public decimal AverageGpa { get; init; }
    public List<GradeCountDto> Distribution { get; init; } = new();
    public decimal PassRate { get; init; }
    public decimal FailRate { get; init; }
}

public record GradeCountDto
{
    public string Grade { get; init; } = string.Empty;
    public int Count { get; init; }
    public decimal Percentage { get; init; }
}

public record FinancialSummaryDto
{
    public decimal TotalCharges { get; init; }
    public decimal TotalPayments { get; init; }
    public decimal OutstandingBalance { get; init; }
    public int StudentsWithBalance { get; init; }
    public int StudentsWithFinancialHold { get; init; }
    public decimal AverageBalance { get; init; }
    public List<FinancialByTermDto> ByTerm { get; init; } = new();
}

public record FinancialByTermDto
{
    public Guid TermId { get; init; }
    public string TermName { get; init; } = string.Empty;
    public decimal TotalTuition { get; init; }
    public decimal TotalFees { get; init; }
    public decimal TotalCollected { get; init; }
}

public record StudentStatisticsDto
{
    public int TotalStudents { get; init; }
    public int ActiveStudents { get; init; }
    public int GraduatedStudents { get; init; }
    public int SuspendedStudents { get; init; }
    public int WithdrawnStudents { get; init; }
    public decimal AverageGpa { get; init; }
    public List<StudentsByProgramDto> ByProgram { get; init; } = new();
    public List<StudentsByStandingDto> ByAcademicStanding { get; init; } = new();
    public List<StudentsByTypeDto> ByType { get; init; } = new();
}

public record StudentsByProgramDto
{
    public Guid ProgramId { get; init; }
    public string ProgramName { get; init; } = string.Empty;
    public int StudentCount { get; init; }
    public decimal AverageGpa { get; init; }
}

public record StudentsByStandingDto
{
    public string AcademicStanding { get; init; } = string.Empty;
    public int StudentCount { get; init; }
    public decimal Percentage { get; init; }
}

public record StudentsByTypeDto
{
    public string StudentType { get; init; } = string.Empty;
    public int StudentCount { get; init; }
    public decimal Percentage { get; init; }
}

public record CourseStatisticsDto
{
    public int TotalCourses { get; init; }
    public int ActiveCourses { get; init; }
    public int TotalSections { get; init; }
    public int OpenSections { get; init; }
    public int FullSections { get; init; }
    public int CancelledSections { get; init; }
    public decimal AverageEnrollmentRate { get; init; }
    public List<CoursePopularityDto> MostPopularCourses { get; init; } = new();
    public List<CoursePopularityDto> LeastPopularCourses { get; init; } = new();
}

public record CoursePopularityDto
{
    public Guid CourseId { get; init; }
    public string CourseCode { get; init; } = string.Empty;
    public string CourseName { get; init; } = string.Empty;
    public int TotalEnrollments { get; init; }
    public int TotalSections { get; init; }
    public decimal FillRate { get; init; }
}

public record DashboardSummaryDto
{
    public int TotalStudents { get; init; }
    public int TotalCourses { get; init; }
    public int TotalEnrollments { get; init; }
    public int ActiveTerms { get; init; }
    public decimal TotalRevenue { get; init; }
    public decimal OutstandingBalance { get; init; }
    public decimal AverageGpa { get; init; }
    public List<RecentActivityDto> RecentActivities { get; init; } = new();
    public List<UpcomingDeadlineDto> UpcomingDeadlines { get; init; } = new();
}

public record RecentActivityDto
{
    public DateTime Timestamp { get; init; }
    public string ActivityType { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? EntityId { get; init; }
}

public record UpcomingDeadlineDto
{
    public DateTime Deadline { get; init; }
    public string DeadlineType { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? TermId { get; init; }
    public string? TermName { get; init; }
}
