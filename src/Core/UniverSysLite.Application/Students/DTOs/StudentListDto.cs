namespace UniverSysLite.Application.Students.DTOs;

public class StudentListDto
{
    public Guid Id { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? ProgramName { get; set; }
    public string? DepartmentName { get; set; }
    public decimal CumulativeGpa { get; set; }
    public string AcademicStanding { get; set; } = string.Empty;
    public bool HasFinancialHold { get; set; }
    public bool HasAcademicHold { get; set; }
    public DateTime CreatedAt { get; set; }
}
