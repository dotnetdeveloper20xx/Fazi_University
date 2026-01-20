using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Students.DTOs;

namespace UniverSysLite.Application.Students.Queries.GetStudentById;

public class GetStudentByIdQueryHandler : IRequestHandler<GetStudentByIdQuery, Result<StudentDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StudentDetailDto>> Handle(GetStudentByIdQuery request, CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .AsNoTracking()
            .Include(s => s.Program)
            .Include(s => s.Department)
            .Include(s => s.Advisor)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student", request.Id);
        }

        var dto = new StudentDetailDto
        {
            Id = student.Id,
            StudentId = student.StudentId,
            UserId = student.UserId,
            FirstName = student.FirstName,
            MiddleName = student.MiddleName,
            LastName = student.LastName,
            FullName = student.FullName,
            DateOfBirth = student.DateOfBirth,
            Gender = student.Gender.ToString(),
            NationalId = student.NationalId,
            PassportNumber = student.PassportNumber,
            Email = student.Email,
            PersonalEmail = student.PersonalEmail,
            Phone = student.Phone,
            MobilePhone = student.MobilePhone,
            AddressLine1 = student.AddressLine1,
            AddressLine2 = student.AddressLine2,
            City = student.City,
            State = student.State,
            PostalCode = student.PostalCode,
            Country = student.Country,
            Status = student.Status.ToString(),
            Type = student.Type.ToString(),
            AdmissionDate = student.AdmissionDate,
            GraduationDate = student.GraduationDate,
            ExpectedGraduationDate = student.ExpectedGraduationDate,
            ProgramId = student.ProgramId,
            ProgramName = student.Program?.Name,
            DepartmentId = student.DepartmentId,
            DepartmentName = student.Department?.Name,
            AdvisorId = student.AdvisorId,
            AdvisorName = student.Advisor != null ? $"{student.Advisor.FirstName} {student.Advisor.LastName}" : null,
            CumulativeGpa = student.CumulativeGpa,
            TotalCreditsEarned = student.TotalCreditsEarned,
            TotalCreditsAttempted = student.TotalCreditsAttempted,
            AcademicStanding = student.AcademicStanding.ToString(),
            EmergencyContactName = student.EmergencyContactName,
            EmergencyContactPhone = student.EmergencyContactPhone,
            EmergencyContactRelationship = student.EmergencyContactRelationship,
            HasFinancialHold = student.HasFinancialHold,
            HasAcademicHold = student.HasAcademicHold,
            AccountBalance = student.AccountBalance,
            CreatedAt = student.CreatedAt,
            ModifiedAt = student.ModifiedAt
        };

        return Result<StudentDetailDto>.Success(dto);
    }
}
