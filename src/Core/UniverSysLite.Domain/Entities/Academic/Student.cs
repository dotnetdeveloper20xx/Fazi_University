using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities.Academic;

/// <summary>
/// Represents a student in the university system.
/// A student is linked to an ApplicationUser for authentication.
/// </summary>
public class Student : BaseAuditableEntity, ISoftDelete
{
    /// <summary>
    /// Unique student ID (e.g., STU-2026-00001)
    /// </summary>
    public string StudentId { get; set; } = string.Empty;

    /// <summary>
    /// Link to the user account (nullable if student doesn't have system access yet)
    /// </summary>
    public Guid? UserId { get; set; }

    // Personal Information
    public string FirstName { get; set; } = string.Empty;
    public string MiddleName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {MiddleName} {LastName}".Replace("  ", " ").Trim();
    public DateOnly DateOfBirth { get; set; }
    public Gender Gender { get; set; }
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
    public StudentStatus Status { get; set; } = StudentStatus.Applicant;
    public StudentType Type { get; set; } = StudentType.FullTime;
    public DateTime AdmissionDate { get; set; }
    public DateTime? GraduationDate { get; set; }
    public DateTime? ExpectedGraduationDate { get; set; }

    // Program Information
    public Guid? ProgramId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? AdvisorId { get; set; }

    // Academic Standing
    public decimal CumulativeGpa { get; set; }
    public int TotalCreditsEarned { get; set; }
    public int TotalCreditsAttempted { get; set; }
    public AcademicStanding AcademicStanding { get; set; } = AcademicStanding.GoodStanding;

    // Emergency Contact
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactRelationship { get; set; }

    // Financial
    public bool HasFinancialHold { get; set; }
    public bool HasAcademicHold { get; set; }
    public decimal AccountBalance { get; set; }

    // Soft Delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }

    // Navigation Properties
    public virtual ApplicationUser? User { get; set; }
    public virtual Program? Program { get; set; }
    public virtual Department? Department { get; set; }
    public virtual ApplicationUser? Advisor { get; set; }
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public virtual ICollection<StudentDocument> Documents { get; set; } = new List<StudentDocument>();
}
