using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Grades.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Grades.Queries.GetStudentGpa;

public class GetStudentGpaQueryHandler : IRequestHandler<GetStudentGpaQuery, Result<GpaSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;

    private static readonly HashSet<string> GradedGrades = new()
    {
        "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"
    };

    private static readonly HashSet<string> PassingGrades = new()
    {
        "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "P"
    };

    public GetStudentGpaQueryHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
    }

    public async Task<Result<GpaSummaryDto>> Handle(
        GetStudentGpaQuery request,
        CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && !s.IsDeleted, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student", request.StudentId);
        }

        // Get current term
        var today = DateOnly.FromDateTime(_dateTimeService.UtcNow);
        var currentTerm = await _context.Terms
            .Where(t => t.StartDate <= today && t.EndDate >= today && t.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        // Get all completed/graded enrollments
        var enrollments = await _context.Enrollments
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Term)
            .Where(e => e.StudentId == request.StudentId &&
                        e.IsGradeFinalized &&
                        !string.IsNullOrEmpty(e.Grade))
            .ToListAsync(cancellationToken);

        decimal totalQualityPoints = 0;
        int totalCreditsAttempted = 0;
        int totalCreditsEarned = 0;
        decimal? currentTermGpa = null;
        int? currentTermCredits = null;

        decimal currentTermQualityPoints = 0;
        int currentTermCreditsAttempted = 0;

        foreach (var enrollment in enrollments)
        {
            var creditHours = enrollment.CourseSection.Course.CreditHours;
            var grade = enrollment.Grade ?? "";
            var gradePoints = enrollment.GradePoints ?? 0;
            var qualityPoints = creditHours * gradePoints;

            // Count for GPA calculation
            if (GradedGrades.Contains(grade))
            {
                totalCreditsAttempted += creditHours;
                totalQualityPoints += qualityPoints;

                // Track current term separately
                if (currentTerm != null && enrollment.CourseSection.TermId == currentTerm.Id)
                {
                    currentTermCreditsAttempted += creditHours;
                    currentTermQualityPoints += qualityPoints;
                }
            }

            // Count credits earned for passing grades
            if (PassingGrades.Contains(grade))
            {
                totalCreditsEarned += creditHours;
            }
        }

        var cumulativeGpa = totalCreditsAttempted > 0
            ? Math.Round(totalQualityPoints / totalCreditsAttempted, 2)
            : 0;

        if (currentTermCreditsAttempted > 0)
        {
            currentTermGpa = Math.Round(currentTermQualityPoints / currentTermCreditsAttempted, 2);
            currentTermCredits = currentTermCreditsAttempted;
        }

        // Determine academic standing
        var academicStanding = GetAcademicStanding(cumulativeGpa, totalCreditsAttempted);

        var gpaSummary = new GpaSummaryDto
        {
            StudentId = student.Id,
            StudentId_Display = student.StudentId,
            StudentName = $"{student.User.FirstName} {student.User.LastName}",
            CumulativeGpa = cumulativeGpa,
            TotalCreditsAttempted = totalCreditsAttempted,
            TotalCreditsEarned = totalCreditsEarned,
            CurrentTermGpa = currentTermGpa,
            CurrentTermCredits = currentTermCredits,
            AcademicStanding = academicStanding
        };

        return Result<GpaSummaryDto>.Success(gpaSummary);
    }

    private static string GetAcademicStanding(decimal gpa, int credits)
    {
        if (credits == 0) return "New Student";
        if (gpa >= 3.5m) return "Dean's List";
        if (gpa >= 2.0m) return "Good Standing";
        if (gpa >= 1.5m) return "Academic Warning";
        return "Academic Probation";
    }
}
