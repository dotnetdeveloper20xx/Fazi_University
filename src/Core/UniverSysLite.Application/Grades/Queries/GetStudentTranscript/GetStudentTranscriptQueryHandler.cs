using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Grades.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Grades.Queries.GetStudentTranscript;

public class GetStudentTranscriptQueryHandler : IRequestHandler<GetStudentTranscriptQuery, Result<TranscriptDto>>
{
    private readonly IApplicationDbContext _context;

    private static readonly HashSet<string> GradedGrades = new()
    {
        "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"
    };

    private static readonly HashSet<string> PassingGrades = new()
    {
        "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "P"
    };

    public GetStudentTranscriptQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TranscriptDto>> Handle(
        GetStudentTranscriptQuery request,
        CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .Include(s => s.Program)
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && !s.IsDeleted, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student", request.StudentId);
        }

        var enrollments = await _context.Enrollments
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Term)
            .Where(e => e.StudentId == request.StudentId &&
                        (e.Status == EnrollmentStatus.Completed ||
                         e.Status == EnrollmentStatus.Failed ||
                         e.Status == EnrollmentStatus.Withdrawn ||
                         (e.IsGradeFinalized && !string.IsNullOrEmpty(e.Grade))))
            .OrderBy(e => e.CourseSection.Term.StartDate)
            .ThenBy(e => e.CourseSection.Course.Code)
            .ToListAsync(cancellationToken);

        var termGroups = enrollments
            .GroupBy(e => e.CourseSection.Term)
            .OrderBy(g => g.Key.StartDate)
            .ToList();

        var terms = new List<TranscriptTermDto>();
        decimal totalQualityPoints = 0;
        int totalCreditsAttempted = 0;
        int totalCreditsEarned = 0;

        foreach (var termGroup in termGroups)
        {
            var term = termGroup.Key;
            var courses = new List<TranscriptCourseDto>();
            decimal termQualityPoints = 0;
            int termCreditsAttempted = 0;
            int termCreditsEarned = 0;

            foreach (var enrollment in termGroup)
            {
                var creditHours = enrollment.CourseSection.Course.CreditHours;
                var grade = enrollment.Grade ?? "";
                var gradePoints = enrollment.GradePoints ?? 0;
                var qualityPoints = creditHours * gradePoints;

                // Count credits attempted for graded courses (not W, I, P, NP)
                if (GradedGrades.Contains(grade))
                {
                    termCreditsAttempted += creditHours;
                    termQualityPoints += qualityPoints;
                }

                // Count credits earned for passing grades
                if (PassingGrades.Contains(grade))
                {
                    termCreditsEarned += creditHours;
                }

                courses.Add(new TranscriptCourseDto
                {
                    CourseCode = enrollment.CourseSection.Course.Code,
                    CourseName = enrollment.CourseSection.Course.Name,
                    CreditHours = creditHours,
                    Grade = grade,
                    GradePoints = gradePoints,
                    QualityPoints = qualityPoints
                });
            }

            var termGpa = termCreditsAttempted > 0
                ? Math.Round(termQualityPoints / termCreditsAttempted, 2)
                : 0;

            terms.Add(new TranscriptTermDto
            {
                TermId = term.Id,
                TermName = term.Name,
                TermGpa = termGpa,
                CreditsAttempted = termCreditsAttempted,
                CreditsEarned = termCreditsEarned,
                Courses = courses
            });

            totalQualityPoints += termQualityPoints;
            totalCreditsAttempted += termCreditsAttempted;
            totalCreditsEarned += termCreditsEarned;
        }

        var cumulativeGpa = totalCreditsAttempted > 0
            ? Math.Round(totalQualityPoints / totalCreditsAttempted, 2)
            : 0;

        var transcript = new TranscriptDto
        {
            StudentId = student.Id,
            StudentId_Display = student.StudentId,
            StudentName = $"{student.FirstName} {student.LastName}",
            ProgramName = student.Program?.Name ?? "Undeclared",
            CumulativeGpa = cumulativeGpa,
            TotalCreditsAttempted = totalCreditsAttempted,
            TotalCreditsEarned = totalCreditsEarned,
            TotalGradePoints = totalQualityPoints,
            Terms = terms
        };

        return Result<TranscriptDto>.Success(transcript);
    }
}
