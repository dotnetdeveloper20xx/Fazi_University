namespace UniverSysLite.Application.Academics.DTOs;

public class CourseSectionDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public Guid TermId { get; set; }
    public string TermName { get; set; } = string.Empty;
    public string SectionNumber { get; set; } = string.Empty;
    public Guid? InstructorId { get; set; }
    public string? InstructorName { get; set; }
    public int MaxEnrollment { get; set; }
    public int CurrentEnrollment { get; set; }
    public int WaitlistCapacity { get; set; }
    public int WaitlistCount { get; set; }
    public string? Room { get; set; }
    public string? Building { get; set; }
    public string? Schedule { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string? DaysOfWeek { get; set; }
    public bool IsOpen { get; set; }
    public bool IsCancelled { get; set; }
    public int AvailableSeats { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CourseSectionListDto
{
    public Guid Id { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public string SectionNumber { get; set; } = string.Empty;
    public string? InstructorName { get; set; }
    public int MaxEnrollment { get; set; }
    public int CurrentEnrollment { get; set; }
    public int AvailableSeats { get; set; }
    public string? Schedule { get; set; }
    public string? Room { get; set; }
    public bool IsOpen { get; set; }
    public bool IsCancelled { get; set; }
}
