using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.DeleteCourse;

public class DeleteCourseCommandHandler : IRequestHandler<DeleteCourseCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public DeleteCourseCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(DeleteCourseCommand request, CancellationToken cancellationToken)
    {
        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (course == null)
        {
            throw new NotFoundException("Course", request.Id);
        }

        // Check for active sections
        var hasActiveSections = await _context.CourseSections
            .AnyAsync(s => s.CourseId == request.Id && !s.IsDeleted && !s.IsCancelled, cancellationToken);

        if (hasActiveSections)
        {
            return Result.Failure("Cannot delete course with active sections. Please cancel or delete sections first.");
        }

        course.IsDeleted = true;
        course.DeletedAt = _dateTimeService.UtcNow;
        course.IsActive = false;

        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            AuditAction.SoftDeleted,
            "Course",
            course.Id.ToString(),
            $"Course {course.Code} - {course.Name} deleted (soft delete)",
            severity: AuditSeverity.Warning,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
