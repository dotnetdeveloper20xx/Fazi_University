using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Students.Commands.UpdateStudent;

public class UpdateStudentCommandHandler : IRequestHandler<UpdateStudentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public UpdateStudentCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(UpdateStudentCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student", request.Id);
        }

        // Capture old values for audit
        var oldValues = new
        {
            student.FirstName,
            student.LastName,
            student.Status,
            student.ProgramId,
            student.AcademicStanding,
            student.HasFinancialHold,
            student.HasAcademicHold
        };

        // Update fields if provided
        if (!string.IsNullOrEmpty(request.FirstName))
            student.FirstName = request.FirstName;

        if (request.MiddleName != null)
            student.MiddleName = request.MiddleName;

        if (!string.IsNullOrEmpty(request.LastName))
            student.LastName = request.LastName;

        if (request.DateOfBirth.HasValue)
            student.DateOfBirth = request.DateOfBirth.Value;

        if (!string.IsNullOrEmpty(request.Gender) &&
            Enum.TryParse<Gender>(request.Gender, true, out var gender))
        {
            student.Gender = gender;
        }

        if (request.NationalId != null)
            student.NationalId = request.NationalId;

        if (request.PassportNumber != null)
            student.PassportNumber = request.PassportNumber;

        if (request.PersonalEmail != null)
            student.PersonalEmail = request.PersonalEmail;

        if (request.Phone != null)
            student.Phone = request.Phone;

        if (request.MobilePhone != null)
            student.MobilePhone = request.MobilePhone;

        if (request.AddressLine1 != null)
            student.AddressLine1 = request.AddressLine1;

        if (request.AddressLine2 != null)
            student.AddressLine2 = request.AddressLine2;

        if (request.City != null)
            student.City = request.City;

        if (request.State != null)
            student.State = request.State;

        if (request.PostalCode != null)
            student.PostalCode = request.PostalCode;

        if (request.Country != null)
            student.Country = request.Country;

        if (!string.IsNullOrEmpty(request.Status) &&
            Enum.TryParse<StudentStatus>(request.Status, true, out var status))
        {
            student.Status = status;
        }

        if (!string.IsNullOrEmpty(request.Type) &&
            Enum.TryParse<StudentType>(request.Type, true, out var type))
        {
            student.Type = type;
        }

        if (request.ProgramId.HasValue)
            student.ProgramId = request.ProgramId;

        if (request.DepartmentId.HasValue)
            student.DepartmentId = request.DepartmentId;

        if (request.AdvisorId.HasValue)
            student.AdvisorId = request.AdvisorId;

        if (request.ExpectedGraduationDate.HasValue)
            student.ExpectedGraduationDate = request.ExpectedGraduationDate;

        if (!string.IsNullOrEmpty(request.AcademicStanding) &&
            Enum.TryParse<AcademicStanding>(request.AcademicStanding, true, out var standing))
        {
            student.AcademicStanding = standing;
        }

        if (request.EmergencyContactName != null)
            student.EmergencyContactName = request.EmergencyContactName;

        if (request.EmergencyContactPhone != null)
            student.EmergencyContactPhone = request.EmergencyContactPhone;

        if (request.EmergencyContactRelationship != null)
            student.EmergencyContactRelationship = request.EmergencyContactRelationship;

        if (request.HasFinancialHold.HasValue)
            student.HasFinancialHold = request.HasFinancialHold.Value;

        if (request.HasAcademicHold.HasValue)
            student.HasAcademicHold = request.HasAcademicHold.Value;

        student.ModifiedAt = _dateTimeService.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Audit log
        var newValues = new
        {
            student.FirstName,
            student.LastName,
            student.Status,
            student.ProgramId,
            student.AcademicStanding,
            student.HasFinancialHold,
            student.HasAcademicHold
        };

        await _auditService.LogAsync(
            AuditAction.Updated,
            "Student",
            student.Id.ToString(),
            $"Student {student.StudentId} - {student.FullName} updated",
            oldValues: oldValues,
            newValues: newValues,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
