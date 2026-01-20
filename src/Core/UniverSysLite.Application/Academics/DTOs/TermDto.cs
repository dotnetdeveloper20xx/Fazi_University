namespace UniverSysLite.Application.Academics.DTOs;

public class TermDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int AcademicYear { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public DateOnly RegistrationStartDate { get; set; }
    public DateOnly RegistrationEndDate { get; set; }
    public DateOnly AddDropDeadline { get; set; }
    public DateOnly WithdrawalDeadline { get; set; }
    public DateOnly GradesDeadline { get; set; }
    public bool IsCurrent { get; set; }
    public bool IsActive { get; set; }
    public int SectionCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TermListDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int AcademicYear { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public bool IsActive { get; set; }
    public int SectionCount { get; set; }
}
