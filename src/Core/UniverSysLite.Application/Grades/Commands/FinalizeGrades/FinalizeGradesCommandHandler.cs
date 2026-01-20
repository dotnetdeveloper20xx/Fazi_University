using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Grades.Commands.FinalizeGrades;

public class FinalizeGradesCommandHandler : IRequestHandler<FinalizeGradesCommand, Result<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public FinalizeGradesCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result<int>> Handle(FinalizeGradesCommand request, CancellationToken cancellationToken)
    {
        var section = await _context.CourseSections
            .Include(cs => cs.Course)
            .Include(cs => cs.Term)
            .FirstOrDefaultAsync(cs => cs.Id == request.CourseSectionId && !cs.IsDeleted, cancellationToken);

        if (section == null)
        {
            throw new NotFoundException("Course Section", request.CourseSectionId);
        }

        // Get all enrolled students without grades or with unfinalized grades
        var enrollments = await _context.Enrollments
            .Where(e => e.CourseSectionId == request.CourseSectionId &&
                        e.Status == EnrollmentStatus.Enrolled &&
                        !e.IsGradeFinalized)
            .ToListAsync(cancellationToken);

        var missingGrades = enrollments.Where(e => string.IsNullOrEmpty(e.Grade)).ToList();
        if (missingGrades.Any())
        {
            return Result<int>.Failure($"{missingGrades.Count} student(s) do not have grades submitted. Please submit all grades before finalizing.");
        }

        // Finalize all grades and update enrollment status
        foreach (var enrollment in enrollments)
        {
            enrollment.IsGradeFinalized = true;
            enrollment.ModifiedAt = _dateTimeService.UtcNow;

            // Update enrollment status based on grade
            if (enrollment.Grade == "F" || enrollment.Grade == "NP")
            {
                enrollment.Status = EnrollmentStatus.Failed;
            }
            else if (enrollment.Grade == "I")
            {
                enrollment.Status = EnrollmentStatus.Incomplete;
            }
            else if (enrollment.Grade != "W")
            {
                enrollment.Status = EnrollmentStatus.Completed;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            AuditAction.Updated,
            "CourseSection",
            section.Id.ToString(),
            $"Grades finalized for {section.Course.Code}-{section.SectionNumber}: {enrollments.Count} student(s)",
            severity: AuditSeverity.Warning,
            cancellationToken: cancellationToken);

        return Result<int>.Success(enrollments.Count);
    }
}
