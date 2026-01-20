using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Reports.DTOs;

namespace UniverSysLite.Application.Reports.Queries.GetGradeDistribution;

public class GetGradeDistributionQueryHandler : IRequestHandler<GetGradeDistributionQuery, Result<GradeDistributionDto>>
{
    private readonly IApplicationDbContext _context;

    private static readonly HashSet<string> PassingGrades = new()
    {
        "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "P"
    };

    private static readonly HashSet<string> FailingGrades = new() { "F", "NP" };

    public GetGradeDistributionQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<GradeDistributionDto>> Handle(
        GetGradeDistributionQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Enrollments
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Term)
            .Where(e => e.IsGradeFinalized && !string.IsNullOrEmpty(e.Grade))
            .AsQueryable();

        if (request.TermId.HasValue)
        {
            query = query.Where(e => e.CourseSection.TermId == request.TermId.Value);
        }

        if (request.CourseId.HasValue)
        {
            query = query.Where(e => e.CourseSection.CourseId == request.CourseId.Value);
        }

        if (request.DepartmentId.HasValue)
        {
            query = query.Where(e => e.CourseSection.Course.DepartmentId == request.DepartmentId.Value);
        }

        var enrollments = await query.ToListAsync(cancellationToken);

        if (!enrollments.Any())
        {
            return Result<GradeDistributionDto>.Success(new GradeDistributionDto
            {
                TotalGrades = 0,
                AverageGpa = 0,
                Distribution = new List<GradeCountDto>(),
                PassRate = 0,
                FailRate = 0
            });
        }

        var totalGrades = enrollments.Count;

        // Calculate average GPA
        var gradesWithPoints = enrollments
            .Where(e => e.GradePoints.HasValue)
            .Select(e => e.GradePoints!.Value)
            .ToList();

        var averageGpa = gradesWithPoints.Any()
            ? Math.Round(gradesWithPoints.Average(), 2)
            : 0;

        // Grade distribution
        var distribution = enrollments
            .GroupBy(e => e.Grade)
            .Select(g => new GradeCountDto
            {
                Grade = g.Key!,
                Count = g.Count(),
                Percentage = Math.Round((decimal)g.Count() / totalGrades * 100, 1)
            })
            .OrderByDescending(g => GetGradeOrder(g.Grade))
            .ToList();

        // Pass/Fail rates
        var passingCount = enrollments.Count(e => PassingGrades.Contains(e.Grade ?? ""));
        var failingCount = enrollments.Count(e => FailingGrades.Contains(e.Grade ?? ""));

        var passRate = Math.Round((decimal)passingCount / totalGrades * 100, 1);
        var failRate = Math.Round((decimal)failingCount / totalGrades * 100, 1);

        // Get term/course info if filtered
        string? termName = null;
        string? courseName = null;

        if (request.TermId.HasValue)
        {
            var term = await _context.Terms.FindAsync(new object[] { request.TermId.Value }, cancellationToken);
            termName = term?.Name;
        }

        if (request.CourseId.HasValue)
        {
            var course = await _context.Courses.FindAsync(new object[] { request.CourseId.Value }, cancellationToken);
            courseName = course?.Name;
        }

        var result = new GradeDistributionDto
        {
            TermId = request.TermId,
            TermName = termName,
            CourseId = request.CourseId,
            CourseName = courseName,
            TotalGrades = totalGrades,
            AverageGpa = averageGpa,
            Distribution = distribution,
            PassRate = passRate,
            FailRate = failRate
        };

        return Result<GradeDistributionDto>.Success(result);
    }

    private static int GetGradeOrder(string grade)
    {
        return grade switch
        {
            "A+" => 13,
            "A" => 12,
            "A-" => 11,
            "B+" => 10,
            "B" => 9,
            "B-" => 8,
            "C+" => 7,
            "C" => 6,
            "C-" => 5,
            "D+" => 4,
            "D" => 3,
            "D-" => 2,
            "F" => 1,
            _ => 0
        };
    }
}
