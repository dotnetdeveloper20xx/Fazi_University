using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.CreateCourse;

public class CreateCourseCommandHandler : IRequestHandler<CreateCourseCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public CreateCourseCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result<Guid>> Handle(CreateCourseCommand request, CancellationToken cancellationToken)
    {
        // Validate department exists
        var departmentExists = await _context.Departments
            .AnyAsync(d => d.Id == request.DepartmentId && !d.IsDeleted, cancellationToken);

        if (!departmentExists)
        {
            return Result<Guid>.Failure("Department not found.");
        }

        // Check for duplicate code
        var codeExists = await _context.Courses
            .AnyAsync(c => c.Code.ToLower() == request.Code.ToLower(), cancellationToken);

        if (codeExists)
        {
            return Result<Guid>.Failure("A course with this code already exists.");
        }

        // Parse course level
        if (!Enum.TryParse<CourseLevel>(request.Level, true, out var level))
        {
            return Result<Guid>.Failure("Invalid course level.");
        }

        var course = new Course
        {
            Id = Guid.NewGuid(),
            Code = request.Code.ToUpper(),
            Name = request.Name,
            Description = request.Description,
            DepartmentId = request.DepartmentId,
            CreditHours = request.CreditHours,
            LectureHours = request.LectureHours,
            LabHours = request.LabHours,
            Level = level,
            IsActive = true,
            CreatedAt = _dateTimeService.UtcNow
        };

        _context.Courses.Add(course);

        // Add prerequisites
        if (request.Prerequisites?.Any() == true)
        {
            foreach (var prereq in request.Prerequisites)
            {
                var prereqExists = await _context.Courses
                    .AnyAsync(c => c.Id == prereq.PrerequisiteCourseId && !c.IsDeleted, cancellationToken);

                if (!prereqExists)
                {
                    return Result<Guid>.Failure($"Prerequisite course not found.");
                }

                var coursePrerequisite = new CoursePrerequisite
                {
                    Id = Guid.NewGuid(),
                    CourseId = course.Id,
                    PrerequisiteCourseId = prereq.PrerequisiteCourseId,
                    MinimumGrade = prereq.MinimumGrade,
                    IsConcurrent = prereq.IsConcurrent
                };

                _context.CoursePrerequisites.Add(coursePrerequisite);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            AuditAction.Created,
            "Course",
            course.Id.ToString(),
            $"Course {course.Code} - {course.Name} created",
            cancellationToken: cancellationToken);

        return Result<Guid>.Success(course.Id);
    }
}
