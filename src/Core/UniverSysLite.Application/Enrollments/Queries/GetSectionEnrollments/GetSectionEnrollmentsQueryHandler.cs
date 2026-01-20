using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Enrollments.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Enrollments.Queries.GetSectionEnrollments;

public class GetSectionEnrollmentsQueryHandler : IRequestHandler<GetSectionEnrollmentsQuery, Result<List<SectionEnrollmentDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetSectionEnrollmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SectionEnrollmentDto>>> Handle(
        GetSectionEnrollmentsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Enrollments
            .Include(e => e.Student)
                .ThenInclude(s => s.User)
            .Include(e => e.Student)
                .ThenInclude(s => s.Program)
            .Where(e => e.CourseSectionId == request.CourseSectionId);

        // Filter by status if specified
        if (!string.IsNullOrWhiteSpace(request.Status) &&
            Enum.TryParse<EnrollmentStatus>(request.Status, true, out var status))
        {
            query = query.Where(e => e.Status == status);
        }
        else if (!request.IncludeAll)
        {
            // By default, only show active enrollments (Enrolled or Waitlisted)
            query = query.Where(e =>
                e.Status == EnrollmentStatus.Enrolled ||
                e.Status == EnrollmentStatus.Waitlisted);
        }

        var enrollments = await query
            .OrderBy(e => e.Student.User.LastName)
            .ThenBy(e => e.Student.User.FirstName)
            .Select(e => new SectionEnrollmentDto
            {
                Id = e.Id,
                StudentId = e.StudentId,
                StudentId_Display = e.Student.StudentId,
                StudentName = e.Student.User.FirstName + " " + e.Student.User.LastName,
                StudentEmail = e.Student.User.Email ?? "",
                ProgramName = e.Student.Program != null ? e.Student.Program.Name : "",
                Status = e.Status.ToString(),
                EnrollmentDate = e.EnrollmentDate,
                Grade = e.Grade,
                NumericGrade = e.NumericGrade,
                IsGradeFinalized = e.IsGradeFinalized,
                AttendancePercentage = e.AttendancePercentage
            })
            .ToListAsync(cancellationToken);

        return Result<List<SectionEnrollmentDto>>.Success(enrollments);
    }
}
