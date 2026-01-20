using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Grades.Commands.SubmitGrade;

public class SubmitGradeCommandHandler : IRequestHandler<SubmitGradeCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuditService _auditService;

    private static readonly Dictionary<string, decimal> GradePointsMap = new()
    {
        { "A+", 4.0m }, { "A", 4.0m }, { "A-", 3.7m },
        { "B+", 3.3m }, { "B", 3.0m }, { "B-", 2.7m },
        { "C+", 2.3m }, { "C", 2.0m }, { "C-", 1.7m },
        { "D+", 1.3m }, { "D", 1.0m }, { "D-", 0.7m },
        { "F", 0.0m },
        { "P", 0.0m }, { "NP", 0.0m },
        { "W", 0.0m }, { "I", 0.0m }
    };

    public SubmitGradeCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        ICurrentUserService currentUserService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _currentUserService = currentUserService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(SubmitGradeCommand request, CancellationToken cancellationToken)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
            .FirstOrDefaultAsync(e => e.Id == request.EnrollmentId, cancellationToken);

        if (enrollment == null)
        {
            throw new NotFoundException("Enrollment", request.EnrollmentId);
        }

        if (enrollment.Status != EnrollmentStatus.Enrolled)
        {
            return Result.Failure("Grades can only be submitted for enrolled students.");
        }

        if (enrollment.IsGradeFinalized)
        {
            return Result.Failure("Grade has already been finalized and cannot be changed.");
        }

        var normalizedGrade = request.Grade.ToUpper().Trim();

        if (!GradePointsMap.ContainsKey(normalizedGrade))
        {
            return Result.Failure($"Invalid grade '{request.Grade}'. Valid grades are: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F, P, NP, W, I");
        }

        var oldGrade = enrollment.Grade;

        enrollment.Grade = normalizedGrade;
        enrollment.GradePoints = GradePointsMap[normalizedGrade];
        enrollment.NumericGrade = request.NumericGrade;
        enrollment.GradeSubmittedAt = _dateTimeService.UtcNow;
        enrollment.GradeSubmittedById = _currentUserService.UserId;
        enrollment.ModifiedAt = _dateTimeService.UtcNow;

        if (!string.IsNullOrEmpty(request.Notes))
        {
            enrollment.Notes = string.IsNullOrEmpty(enrollment.Notes)
                ? request.Notes
                : $"{enrollment.Notes}\nGrade note: {request.Notes}";
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            AuditAction.Updated,
            "Enrollment",
            enrollment.Id.ToString(),
            $"Grade submitted for {enrollment.Student.StudentId} in {enrollment.CourseSection.Course.Code}: {normalizedGrade}",
            oldValues: new { Grade = oldGrade },
            newValues: new { Grade = normalizedGrade, NumericGrade = request.NumericGrade },
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
