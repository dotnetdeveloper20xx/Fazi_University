using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Reports.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Reports.Queries.GetStudentStatistics;

public class GetStudentStatisticsQueryHandler : IRequestHandler<GetStudentStatisticsQuery, Result<StudentStatisticsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentStatisticsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StudentStatisticsDto>> Handle(
        GetStudentStatisticsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Students
            .Include(s => s.Program)
            .Where(s => !s.IsDeleted)
            .AsQueryable();

        if (request.DepartmentId.HasValue)
        {
            query = query.Where(s => s.DepartmentId == request.DepartmentId.Value);
        }

        if (request.ProgramId.HasValue)
        {
            query = query.Where(s => s.ProgramId == request.ProgramId.Value);
        }

        var students = await query.ToListAsync(cancellationToken);

        var totalStudents = students.Count;
        var activeStudents = students.Count(s => s.Status == StudentStatus.Active);
        var graduatedStudents = students.Count(s => s.Status == StudentStatus.Graduated);
        var suspendedStudents = students.Count(s => s.Status == StudentStatus.Suspended);
        var withdrawnStudents = students.Count(s => s.Status == StudentStatus.Withdrawn);

        var studentsWithGpa = students.Where(s => s.CumulativeGpa > 0).ToList();
        var averageGpa = studentsWithGpa.Any()
            ? Math.Round(studentsWithGpa.Average(s => s.CumulativeGpa), 2)
            : 0;

        // Students by program
        var byProgram = students
            .Where(s => s.Program != null)
            .GroupBy(s => new { s.ProgramId, s.Program!.Name })
            .Select(g => new StudentsByProgramDto
            {
                ProgramId = g.Key.ProgramId!.Value,
                ProgramName = g.Key.Name,
                StudentCount = g.Count(),
                AverageGpa = g.Any(s => s.CumulativeGpa > 0)
                    ? Math.Round(g.Where(s => s.CumulativeGpa > 0).Average(s => s.CumulativeGpa), 2)
                    : 0
            })
            .OrderByDescending(p => p.StudentCount)
            .ToList();

        // Students by academic standing
        var byStanding = students
            .GroupBy(s => s.AcademicStanding)
            .Select(g => new StudentsByStandingDto
            {
                AcademicStanding = g.Key.ToString(),
                StudentCount = g.Count(),
                Percentage = totalStudents > 0
                    ? Math.Round((decimal)g.Count() / totalStudents * 100, 1)
                    : 0
            })
            .OrderByDescending(s => s.StudentCount)
            .ToList();

        // Students by type
        var byType = students
            .GroupBy(s => s.Type)
            .Select(g => new StudentsByTypeDto
            {
                StudentType = g.Key.ToString(),
                StudentCount = g.Count(),
                Percentage = totalStudents > 0
                    ? Math.Round((decimal)g.Count() / totalStudents * 100, 1)
                    : 0
            })
            .OrderByDescending(t => t.StudentCount)
            .ToList();

        var statistics = new StudentStatisticsDto
        {
            TotalStudents = totalStudents,
            ActiveStudents = activeStudents,
            GraduatedStudents = graduatedStudents,
            SuspendedStudents = suspendedStudents,
            WithdrawnStudents = withdrawnStudents,
            AverageGpa = averageGpa,
            ByProgram = byProgram,
            ByAcademicStanding = byStanding,
            ByType = byType
        };

        return Result<StudentStatisticsDto>.Success(statistics);
    }
}
