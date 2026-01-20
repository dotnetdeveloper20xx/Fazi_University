using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Reports.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Reports.Queries.GetDashboardSummary;

public class GetDashboardSummaryQueryHandler : IRequestHandler<GetDashboardSummaryQuery, Result<DashboardSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;

    public GetDashboardSummaryQueryHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
    }

    public async Task<Result<DashboardSummaryDto>> Handle(
        GetDashboardSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(_dateTimeService.UtcNow);

        // Basic counts
        var totalStudents = await _context.Students
            .CountAsync(s => !s.IsDeleted, cancellationToken);

        var totalCourses = await _context.Courses
            .CountAsync(c => !c.IsDeleted && c.IsActive, cancellationToken);

        var totalEnrollments = await _context.Enrollments
            .CountAsync(e => e.Status == EnrollmentStatus.Enrolled, cancellationToken);

        var activeTerms = await _context.Terms
            .CountAsync(t => t.IsActive && t.StartDate <= today && t.EndDate >= today, cancellationToken);

        // Financial summary
        var totalRevenue = await _context.Students
            .Where(s => !s.IsDeleted)
            .SumAsync(s => s.AccountBalance < 0 ? -s.AccountBalance : 0, cancellationToken);

        var outstandingBalance = await _context.Students
            .Where(s => !s.IsDeleted && s.AccountBalance > 0)
            .SumAsync(s => s.AccountBalance, cancellationToken);

        // Average GPA
        var studentsWithGpa = await _context.Students
            .Where(s => !s.IsDeleted && s.CumulativeGpa > 0)
            .Select(s => s.CumulativeGpa)
            .ToListAsync(cancellationToken);

        var averageGpa = studentsWithGpa.Any()
            ? Math.Round(studentsWithGpa.Average(), 2)
            : 0;

        // Recent activities from audit logs
        var auditLogs = await _context.AuditLogs
            .OrderByDescending(a => a.Timestamp)
            .Take(10)
            .ToListAsync(cancellationToken);

        var recentActivities = auditLogs.Select(a => new RecentActivityDto
        {
            Timestamp = a.Timestamp,
            ActivityType = a.Action.ToString(),
            Description = $"{a.Action} on {a.EntityType}",
            EntityId = a.EntityId
        }).ToList();

        // Upcoming deadlines
        var upcomingDeadlines = new List<UpcomingDeadlineDto>();

        var terms = await _context.Terms
            .Where(t => t.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var term in terms)
        {
            if (term.RegistrationEndDate >= today && term.RegistrationEndDate <= today.AddDays(30))
            {
                upcomingDeadlines.Add(new UpcomingDeadlineDto
                {
                    Deadline = term.RegistrationEndDate.ToDateTime(TimeOnly.MinValue),
                    DeadlineType = "Registration Deadline",
                    Description = $"Registration closes for {term.Name}",
                    TermId = term.Id,
                    TermName = term.Name
                });
            }

            if (term.AddDropDeadline >= today && term.AddDropDeadline <= today.AddDays(30))
            {
                upcomingDeadlines.Add(new UpcomingDeadlineDto
                {
                    Deadline = term.AddDropDeadline.ToDateTime(TimeOnly.MinValue),
                    DeadlineType = "Add/Drop Deadline",
                    Description = $"Add/Drop period ends for {term.Name}",
                    TermId = term.Id,
                    TermName = term.Name
                });
            }

            if (term.WithdrawalDeadline >= today && term.WithdrawalDeadline <= today.AddDays(30))
            {
                upcomingDeadlines.Add(new UpcomingDeadlineDto
                {
                    Deadline = term.WithdrawalDeadline.ToDateTime(TimeOnly.MinValue),
                    DeadlineType = "Withdrawal Deadline",
                    Description = $"Withdrawal deadline for {term.Name}",
                    TermId = term.Id,
                    TermName = term.Name
                });
            }

            if (term.GradesDeadline >= today && term.GradesDeadline <= today.AddDays(30))
            {
                upcomingDeadlines.Add(new UpcomingDeadlineDto
                {
                    Deadline = term.GradesDeadline.ToDateTime(TimeOnly.MinValue),
                    DeadlineType = "Grades Deadline",
                    Description = $"Final grades due for {term.Name}",
                    TermId = term.Id,
                    TermName = term.Name
                });
            }
        }

        var dashboard = new DashboardSummaryDto
        {
            TotalStudents = totalStudents,
            TotalCourses = totalCourses,
            TotalEnrollments = totalEnrollments,
            ActiveTerms = activeTerms,
            TotalRevenue = totalRevenue,
            OutstandingBalance = outstandingBalance,
            AverageGpa = averageGpa,
            RecentActivities = recentActivities,
            UpcomingDeadlines = upcomingDeadlines.OrderBy(d => d.Deadline).Take(10).ToList()
        };

        return Result<DashboardSummaryDto>.Success(dashboard);
    }
}
