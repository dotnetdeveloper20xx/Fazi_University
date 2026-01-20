using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Enrollments.Commands.WithdrawEnrollment;

public class WithdrawEnrollmentCommandHandler : IRequestHandler<WithdrawEnrollmentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public WithdrawEnrollmentCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(WithdrawEnrollmentCommand request, CancellationToken cancellationToken)
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

        if (enrollment.Status != EnrollmentStatus.Enrolled)
        {
            return Result.Failure("Only enrolled students can withdraw from the course.");
        }

        // Check if we're within the withdrawal deadline
        var term = enrollment.CourseSection.Term;
        var today = DateOnly.FromDateTime(_dateTimeService.UtcNow);

        if (today > term.WithdrawalDeadline)
        {
            return Result.Failure($"Withdrawal deadline has passed ({term.WithdrawalDeadline:d}).");
        }

        enrollment.Status = EnrollmentStatus.Withdrawn;
        enrollment.WithdrawalDate = _dateTimeService.UtcNow;
        enrollment.Grade = "W"; // Withdrawal grade
        enrollment.Notes = string.IsNullOrEmpty(enrollment.Notes)
            ? request.Reason
            : $"{enrollment.Notes}\nWithdrawal reason: {request.Reason}";
        enrollment.ModifiedAt = _dateTimeService.UtcNow;

        // Update section counts - withdrawal keeps the seat, just shows W grade
        enrollment.CourseSection.CurrentEnrollment--;

        // Promote first waitlisted student
        await PromoteWaitlistedStudentAsync(enrollment.CourseSectionId, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            AuditAction.Updated,
            "Enrollment",
            enrollment.Id.ToString(),
            $"Student {enrollment.Student.StudentId} withdrew from {enrollment.CourseSection.Course.Code}-{enrollment.CourseSection.SectionNumber}",
            severity: AuditSeverity.Warning,
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
