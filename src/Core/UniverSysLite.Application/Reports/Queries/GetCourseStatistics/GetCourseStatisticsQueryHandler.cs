using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Reports.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Reports.Queries.GetCourseStatistics;

public class GetCourseStatisticsQueryHandler : IRequestHandler<GetCourseStatisticsQuery, Result<CourseStatisticsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCourseStatisticsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CourseStatisticsDto>> Handle(
        GetCourseStatisticsQuery request,
        CancellationToken cancellationToken)
    {
        var coursesQuery = _context.Courses.Where(c => !c.IsDeleted);
        var sectionsQuery = _context.CourseSections
            .Include(cs => cs.Course)
            .Where(cs => !cs.IsDeleted);

        if (request.DepartmentId.HasValue)
        {
            coursesQuery = coursesQuery.Where(c => c.DepartmentId == request.DepartmentId.Value);
            sectionsQuery = sectionsQuery.Where(cs => cs.Course.DepartmentId == request.DepartmentId.Value);
        }

        if (request.TermId.HasValue)
        {
            sectionsQuery = sectionsQuery.Where(cs => cs.TermId == request.TermId.Value);
        }

        var courses = await coursesQuery.ToListAsync(cancellationToken);
        var sections = await sectionsQuery.ToListAsync(cancellationToken);

        var totalCourses = courses.Count;
        var activeCourses = courses.Count(c => c.IsActive);
        var totalSections = sections.Count;
        var openSections = sections.Count(s => s.IsOpen && !s.IsCancelled);
        var fullSections = sections.Count(s => s.CurrentEnrollment >= s.MaxEnrollment);
        var cancelledSections = sections.Count(s => s.IsCancelled);

        // Average enrollment rate
        var sectionsWithCapacity = sections.Where(s => s.MaxEnrollment > 0).ToList();
        var avgEnrollmentRate = sectionsWithCapacity.Any()
            ? Math.Round(sectionsWithCapacity.Average(s => (decimal)s.CurrentEnrollment / s.MaxEnrollment * 100), 1)
            : 0;

        // Get enrollment counts by course
        var enrollmentsByCourse = await _context.Enrollments
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
            .Where(e => e.Status == EnrollmentStatus.Enrolled || e.Status == EnrollmentStatus.Completed)
            .GroupBy(e => new {
                e.CourseSection.CourseId,
                e.CourseSection.Course.Code,
                e.CourseSection.Course.Name
            })
            .Select(g => new
            {
                g.Key.CourseId,
                g.Key.Code,
                g.Key.Name,
                TotalEnrollments = g.Count(),
                TotalSections = g.Select(e => e.CourseSectionId).Distinct().Count()
            })
            .ToListAsync(cancellationToken);

        // Calculate fill rates
        var courseStats = enrollmentsByCourse.Select(ec =>
        {
            var courseSections = sections.Where(s => s.CourseId == ec.CourseId).ToList();
            var totalCapacity = courseSections.Sum(s => s.MaxEnrollment);
            var fillRate = totalCapacity > 0
                ? Math.Round((decimal)ec.TotalEnrollments / totalCapacity * 100, 1)
                : 0;

            return new CoursePopularityDto
            {
                CourseId = ec.CourseId,
                CourseCode = ec.Code,
                CourseName = ec.Name,
                TotalEnrollments = ec.TotalEnrollments,
                TotalSections = ec.TotalSections,
                FillRate = fillRate
            };
        }).ToList();

        var mostPopular = courseStats
            .OrderByDescending(c => c.TotalEnrollments)
            .Take(10)
            .ToList();

        var leastPopular = courseStats
            .Where(c => c.TotalEnrollments > 0)
            .OrderBy(c => c.FillRate)
            .Take(10)
            .ToList();

        var statistics = new CourseStatisticsDto
        {
            TotalCourses = totalCourses,
            ActiveCourses = activeCourses,
            TotalSections = totalSections,
            OpenSections = openSections,
            FullSections = fullSections,
            CancelledSections = cancelledSections,
            AverageEnrollmentRate = avgEnrollmentRate,
            MostPopularCourses = mostPopular,
            LeastPopularCourses = leastPopular
        };

        return Result<CourseStatisticsDto>.Success(statistics);
    }
}
