using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Enrollments.Commands.DropEnrollment;

public class DropEnrollmentCommandHandler : IRequestHandler<DropEnrollmentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public DropEnrollmentCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(DropEnrollmentCommand request, CancellationToken cancellationToken)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Term)
            .FirstOrDefaultAsync(e => e.Id == request.EnrollmentId, cancellationToken);

        if (enrollment == null)
        {
            throw new NotFoundException("Enrollment", request.EnrollmentId);
        }

        if (enrollment.Status != EnrollmentStatus.Enrolled && enrollment.Status != EnrollmentStatus.Waitlisted)
        {
            return Result.Failure("Only enrolled or waitlisted students can drop the course.");
        }

        // Check if we're within the drop deadline
        var term = enrollment.CourseSection.Term;
        var today = DateOnly.FromDateTime(_dateTimeService.UtcNow);

        if (today > term.AddDropDeadline)
        {
            return Result.Failure($"Drop deadline has passed ({term.AddDropDeadline:d}). Please use withdrawal instead.");
        }

        var previousStatus = enrollment.Status;
        enrollment.Status = EnrollmentStatus.Dropped;
        enrollment.DropDate = _dateTimeService.UtcNow;
        enrollment.Notes = string.IsNullOrEmpty(enrollment.Notes)
            ? request.Reason
            : $"{enrollment.Notes}\nDrop reason: {request.Reason}";
        enrollment.ModifiedAt = _dateTimeService.UtcNow;

        // Update section counts
        if (previousStatus == EnrollmentStatus.Enrolled)
        {
            enrollment.CourseSection.CurrentEnrollment--;

            // Promote first waitlisted student
            await PromoteWaitlistedStudentAsync(enrollment.CourseSectionId, cancellationToken);
        }
        else if (previousStatus == EnrollmentStatus.Waitlisted)
        {
            enrollment.CourseSection.WaitlistCount--;
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            AuditAction.Updated,
            "Enrollment",
            enrollment.Id.ToString(),
            $"Student {enrollment.Student.StudentId} dropped from {enrollment.CourseSection.Course.Code}-{enrollment.CourseSection.SectionNumber}",
            cancellationToken: cancellationToken);

        return Result.Success();
    }

    private async Task PromoteWaitlistedStudentAsync(Guid sectionId, CancellationToken cancellationToken)
    {
        var waitlistedEnrollment = await _context.Enrollments
            .Where(e => e.CourseSectionId == sectionId && e.Status == EnrollmentStatus.Waitlisted)
            .OrderBy(e => e.EnrollmentDate)
            .FirstOrDefaultAsync(cancellationToken);

        if (waitlistedEnrollment != null)
        {
            waitlistedEnrollment.Status = EnrollmentStatus.Enrolled;
            waitlistedEnrollment.ModifiedAt = _dateTimeService.UtcNow;
            waitlistedEnrollment.Notes = string.IsNullOrEmpty(waitlistedEnrollment.Notes)
                ? "Promoted from waitlist"
                : $"{waitlistedEnrollment.Notes}\nPromoted from waitlist on {_dateTimeService.UtcNow:g}";

            var section = await _context.CourseSections
                .FirstAsync(cs => cs.Id == sectionId, cancellationToken);

            section.CurrentEnrollment++;
            section.WaitlistCount--;
        }
    }
}
