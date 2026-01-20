using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Students.Commands.CreateStudent;

[Authorize(Permission = "Students.Create")]
public record CreateStudentCommand : IRequest<Result<Guid>>
{
    // Personal Information
    public string FirstName { get; init; } = string.Empty;
    public string? MiddleName { get; init; }
    public string LastName { get; init; } = string.Empty;
    public DateOnly DateOfBirth { get; init; }
    public string Gender { get; init; } = string.Empty;
    public string? NationalId { get; init; }
    public string? PassportNumber { get; init; }

    // Contact Information
    public string Email { get; init; } = string.Empty;
    public string? PersonalEmail { get; init; }
    public string? Phone { get; init; }
    public string? MobilePhone { get; init; }

    // Address
    public string? AddressLine1 { get; init; }
    public string? AddressLine2 { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public string? Country { get; init; }

    // Academic Information
    public string Type { get; init; } = "FullTime";
    public Guid? ProgramId { get; init; }
    public Guid? DepartmentId { get; init; }
    public Guid? AdvisorId { get; init; }
    public DateTime? ExpectedGraduationDate { get; init; }

    // Emergency Contact
    public string? EmergencyContactName { get; init; }
    public string? EmergencyContactPhone { get; init; }
    public string? EmergencyContactRelationship { get; init; }

    // Create user account?
    public bool CreateUserAccount { get; init; } = false;
}
