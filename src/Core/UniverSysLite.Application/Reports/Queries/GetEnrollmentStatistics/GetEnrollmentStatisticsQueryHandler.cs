using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Reports.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Reports.Queries.GetEnrollmentStatistics;

public class GetEnrollmentStatisticsQueryHandler : IRequestHandler<GetEnrollmentStatisticsQuery, Result<EnrollmentStatisticsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetEnrollmentStatisticsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<EnrollmentStatisticsDto>> Handle(
        GetEnrollmentStatisticsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Enrollments
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
                    .ThenInclude(c => c.Department)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Term)
            .AsQueryable();

        if (request.TermId.HasValue)
        {
            query = query.Where(e => e.CourseSection.TermId == request.TermId.Value);
        }

        if (request.DepartmentId.HasValue)
        {
            query = query.Where(e => e.CourseSection.Course.DepartmentId == request.DepartmentId.Value);
        }

        var enrollments = await query.ToListAsync(cancellationToken);

        var totalEnrollments = enrollments.Count;
        var activeEnrollments = enrollments.Count(e => e.Status == EnrollmentStatus.Enrolled);
        var droppedEnrollments = enrollments.Count(e => e.Status == EnrollmentStatus.Dropped);
        var withdrawnEnrollments = enrollments.Count(e => e.Status == EnrollmentStatus.Withdrawn);
        var completedEnrollments = enrollments.Count(e => e.Status == EnrollmentStatus.Completed);
        var waitlistedStudents = enrollments.Count(e => e.Status == EnrollmentStatus.Waitlisted);

        var uniqueStudents = enrollments.Select(e => e.StudentId).Distinct().Count();
        var uniqueSections = enrollments.Select(e => e.CourseSectionId).Distinct().Count();

        var avgEnrollmentsPerStudent = uniqueStudents > 0
            ? Math.Round((decimal)totalEnrollments / uniqueStudents, 2)
            : 0;

        var avgEnrollmentsPerSection = uniqueSections > 0
            ? Math.Round((decimal)totalEnrollments / uniqueSections, 2)
            : 0;

        // Enrollments by term
        var enrollmentsByTerm = enrollments
            .GroupBy(e => new { e.CourseSection.TermId, e.CourseSection.Term.Name })
            .Select(g => new EnrollmentByTermDto
            {
                TermId = g.Key.TermId,
                TermName = g.Key.Name,
                TotalEnrollments = g.Count(),
                UniqueStudents = g.Select(e => e.StudentId).Distinct().Count()
            })
            .OrderByDescending(e => e.TotalEnrollments)
            .ToList();

        // Enrollments by department
        var enrollmentsByDepartment = enrollments
            .Where(e => e.CourseSection.Course.Department != null)
            .GroupBy(e => new { e.CourseSection.Course.DepartmentId, e.CourseSection.Course.Department!.Name })
            .Select(g => new EnrollmentByDepartmentDto
            {
                DepartmentId = g.Key.DepartmentId,
                DepartmentName = g.Key.Name,
                TotalEnrollments = g.Count(),
                TotalSections = g.Select(e => e.CourseSectionId).Distinct().Count()
            })
            .OrderByDescending(e => e.TotalEnrollments)
            .ToList();

        var statistics = new EnrollmentStatisticsDto
        {
            TotalEnrollments = totalEnrollments,
            ActiveEnrollments = activeEnrollments,
            DroppedEnrollments = droppedEnrollments,
            WithdrawnEnrollments = withdrawnEnrollments,
            CompletedEnrollments = completedEnrollments,
            WaitlistedStudents = waitlistedStudents,
            AverageEnrollmentsPerStudent = avgEnrollmentsPerStudent,
            AverageEnrollmentsPerSection = avgEnrollmentsPerSection,
            EnrollmentsByTerm = enrollmentsByTerm,
            EnrollmentsByDepartment = enrollmentsByDepartment
        };

        return Result<EnrollmentStatisticsDto>.Success(statistics);
    }
}
