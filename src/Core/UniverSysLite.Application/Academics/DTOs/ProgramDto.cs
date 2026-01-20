namespace UniverSysLite.Application.Academics.DTOs;

public class ProgramDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DegreeType { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int TotalCreditsRequired { get; set; }
    public int DurationYears { get; set; }
    public decimal TuitionPerCredit { get; set; }
    public bool IsActive { get; set; }
    public int CourseCount { get; set; }
    public int StudentCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ProgramListDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DegreeType { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public int TotalCreditsRequired { get; set; }
    public int DurationYears { get; set; }
    public decimal TuitionPerCredit { get; set; }
    public bool IsActive { get; set; }
    public int StudentCount { get; set; }
}
