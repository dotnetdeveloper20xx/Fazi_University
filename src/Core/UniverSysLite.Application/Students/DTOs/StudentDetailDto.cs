namespace UniverSysLite.Application.Students.DTOs;

public class StudentDetailDto
{
    public Guid Id { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public Guid? UserId { get; set; }

    // Personal Information
    public string FirstName { get; set; } = string.Empty;
    public string MiddleName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string? NationalId { get; set; }
    public string? PassportNumber { get; set; }

    // Contact Information
    public string Email { get; set; } = string.Empty;
    public string? PersonalEmail { get; set; }
    public string? Phone { get; set; }
    public string? MobilePhone { get; set; }

    // Address
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }

    // Academic Information
    public string Status { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime AdmissionDate { get; set; }
    public DateTime? GraduationDate { get; set; }
    public DateTime? ExpectedGraduationDate { get; set; }

    // Program Information
    public Guid? ProgramId { get; set; }
    public string? ProgramName { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public Guid? AdvisorId { get; set; }
    public string? AdvisorName { get; set; }

    // Academic Standing
    public decimal CumulativeGpa { get; set; }
    public int TotalCreditsEarned { get; set; }
    public int TotalCreditsAttempted { get; set; }
    public string AcademicStanding { get; set; } = string.Empty;

    // Emergency Contact
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactRelationship { get; set; }

    // Financial
    public bool HasFinancialHold { get; set; }
    public bool HasAcademicHold { get; set; }
    public decimal AccountBalance { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? ModifiedAt { get; set; }
}
