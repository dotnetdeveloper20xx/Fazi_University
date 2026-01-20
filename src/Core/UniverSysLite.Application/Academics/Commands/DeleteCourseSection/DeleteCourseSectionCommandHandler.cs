using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.DeleteCourseSection;

public class DeleteCourseSectionCommandHandler : IRequestHandler<DeleteCourseSectionCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public DeleteCourseSectionCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(DeleteCourseSectionCommand request, CancellationToken cancellationToken)
    {
        var section = await _context.CourseSections
            .Include(cs => cs.Course)
            .FirstOrDefaultAsync(cs => cs.Id == request.Id && !cs.IsDeleted, cancellationToken);

        if (section == null)
        {
            throw new NotFoundException("Course Section", request.Id);
        }

        // Check for active enrollments
        var hasActiveEnrollments = await _context.Enrollments
            .AnyAsync(e => e.CourseSectionId == request.Id &&
                          (e.Status == EnrollmentStatus.Enrolled || e.Status == EnrollmentStatus.Waitlisted),
                      cancellationToken);

        if (hasActiveEnrollments)
        {
            return Result.Failure("Cannot delete section with active enrollments. Please drop or withdraw all students first.");
        }

        section.IsDeleted = true;
        section.DeletedAt = _dateTimeService.UtcNow;
        section.IsOpen = false;

        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            AuditAction.SoftDeleted,
            "CourseSection",
            section.Id.ToString(),
            $"Course section {section.Course.Code}-{section.SectionNumber} deleted (soft delete)",
            severity: AuditSeverity.Warning,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
