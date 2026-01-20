namespace UniverSysLite.Application.Academics.DTOs;

public class CourseDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int CreditHours { get; set; }
    public int LectureHours { get; set; }
    public int LabHours { get; set; }
    public string Level { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<CoursePrerequisiteDto> Prerequisites { get; set; } = new();
    public int SectionCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CourseListDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public int CreditHours { get; set; }
    public string Level { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int SectionCount { get; set; }
}

public class CoursePrerequisiteDto
{
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public string? MinimumGrade { get; set; }
    public bool IsConcurrent { get; set; }
}
