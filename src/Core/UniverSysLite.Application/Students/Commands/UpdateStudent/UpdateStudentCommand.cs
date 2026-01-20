using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Students.Commands.UpdateStudent;

[Authorize(Permission = "Students.Edit")]
public record UpdateStudentCommand : IRequest<Result>
{
    public Guid Id { get; init; }

    // Personal Information
    public string? FirstName { get; init; }
    public string? MiddleName { get; init; }
    public string? LastName { get; init; }
    public DateOnly? DateOfBirth { get; init; }
    public string? Gender { get; init; }
    public string? NationalId { get; init; }
    public string? PassportNumber { get; init; }

    // Contact Information
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
    public string? Status { get; init; }
    public string? Type { get; init; }
    public Guid? ProgramId { get; init; }
    public Guid? DepartmentId { get; init; }
    public Guid? AdvisorId { get; init; }
    public DateTime? ExpectedGraduationDate { get; init; }
    public string? AcademicStanding { get; init; }

    // Emergency Contact
    public string? EmergencyContactName { get; init; }
    public string? EmergencyContactPhone { get; init; }
    public string? EmergencyContactRelationship { get; init; }

    // Holds
    public bool? HasFinancialHold { get; init; }
    public bool? HasAcademicHold { get; init; }
}
