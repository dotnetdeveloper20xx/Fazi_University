using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Students.Commands.CreateStudent;

public class CreateStudentCommandHandler : IRequestHandler<CreateStudentCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public CreateStudentCommandHandler(
        IApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _userManager = userManager;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result<Guid>> Handle(CreateStudentCommand request, CancellationToken cancellationToken)
    {
        // Check if email already exists
        var existingStudent = await _context.Students
            .FirstOrDefaultAsync(s => s.Email == request.Email, cancellationToken);
        if (existingStudent != null)
        {
            return Result<Guid>.Failure("A student with this email already exists.");
        }

        // Generate student ID
        var studentId = await GenerateStudentIdAsync(cancellationToken);

        // Parse enums
        if (!Enum.TryParse<Gender>(request.Gender, true, out var gender))
        {
            return Result<Guid>.Failure("Invalid gender value.");
        }

        if (!Enum.TryParse<StudentType>(request.Type, true, out var type))
        {
            type = StudentType.FullTime;
        }

        var student = new Student
        {
            StudentId = studentId,
            FirstName = request.FirstName,
            MiddleName = request.MiddleName ?? string.Empty,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
            Gender = gender,
            NationalId = request.NationalId,
            PassportNumber = request.PassportNumber,
            Email = request.Email,
            PersonalEmail = request.PersonalEmail,
            Phone = request.Phone,
            MobilePhone = request.MobilePhone,
            AddressLine1 = request.AddressLine1,
            AddressLine2 = request.AddressLine2,
            City = request.City,
            State = request.State,
            PostalCode = request.PostalCode,
            Country = request.Country,
            Status = StudentStatus.Admitted,
            Type = type,
            AdmissionDate = _dateTimeService.UtcNow,
            ExpectedGraduationDate = request.ExpectedGraduationDate,
            ProgramId = request.ProgramId,
            DepartmentId = request.DepartmentId,
            AdvisorId = request.AdvisorId,
            EmergencyContactName = request.EmergencyContactName,
            EmergencyContactPhone = request.EmergencyContactPhone,
            EmergencyContactRelationship = request.EmergencyContactRelationship,
            CumulativeGpa = 0,
            TotalCreditsEarned = 0,
            TotalCreditsAttempted = 0,
            AcademicStanding = AcademicStanding.GoodStanding,
            AccountBalance = 0,
            CreatedAt = _dateTimeService.UtcNow
        };

        // Create user account if requested
        if (request.CreateUserAccount)
        {
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.Phone,
                IsActive = true,
                EmailConfirmed = false,
                MustChangePassword = true,
                CreatedAt = _dateTimeService.UtcNow
            };

            var tempPassword = GenerateTemporaryPassword();
            var result = await _userManager.CreateAsync(user, tempPassword);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "Student");
                student.UserId = user.Id;

                // Create user profile
                var profile = new UserProfile { UserId = user.Id };
                _context.UserProfiles.Add(profile);

                // Create user settings
                var settings = new UserSettings { UserId = user.Id };
                _context.UserSettings.Add(settings);
            }
        }

        _context.Students.Add(student);
        await _context.SaveChangesAsync(cancellationToken);

        // Audit log
        await _auditService.LogAsync(
            AuditAction.Created,
            "Student",
            student.Id.ToString(),
            $"Student {student.StudentId} - {student.FullName} created",
            newValues: new { student.StudentId, student.Email, student.FirstName, student.LastName },
            cancellationToken: cancellationToken);

        return Result<Guid>.Success(student.Id);
    }

    private async Task<string> GenerateStudentIdAsync(CancellationToken cancellationToken)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"STU-{year}-";

        var lastStudent = await _context.Students
            .IgnoreQueryFilters()
            .Where(s => s.StudentId.StartsWith(prefix))
            .OrderByDescending(s => s.StudentId)
            .FirstOrDefaultAsync(cancellationToken);

        var nextNumber = 1;
        if (lastStudent != null)
        {
            var lastNumber = int.Parse(lastStudent.StudentId.Substring(prefix.Length));
            nextNumber = lastNumber + 1;
        }

        return $"{prefix}{nextNumber:D5}";
    }

    private static string GenerateTemporaryPassword()
    {
        return $"Temp@{Guid.NewGuid().ToString("N")[..8]}";
    }
}
