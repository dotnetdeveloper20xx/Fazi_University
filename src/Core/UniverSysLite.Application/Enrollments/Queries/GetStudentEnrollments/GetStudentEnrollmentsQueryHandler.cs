using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Enrollments.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Enrollments.Queries.GetStudentEnrollments;

public class GetStudentEnrollmentsQueryHandler : IRequestHandler<GetStudentEnrollmentsQuery, Result<List<StudentEnrollmentDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentEnrollmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<StudentEnrollmentDto>>> Handle(
        GetStudentEnrollmentsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Enrollments
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Term)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Instructor)
            .Where(e => e.StudentId == request.StudentId);

        // Filter by term if specified
        if (request.TermId.HasValue)
        {
            query = query.Where(e => e.CourseSection.TermId == request.TermId.Value);
        }

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
            .OrderByDescending(e => e.CourseSection.Term.StartDate)
            .ThenBy(e => e.CourseSection.Course.Code)
            .Select(e => new StudentEnrollmentDto
            {
                Id = e.Id,
                CourseSectionId = e.CourseSectionId,
                CourseCode = e.CourseSection.Course.Code,
                CourseName = e.CourseSection.Course.Name,
                SectionNumber = e.CourseSection.SectionNumber,
                CreditHours = e.CourseSection.Course.CreditHours,
                InstructorName = e.CourseSection.Instructor != null
                    ? e.CourseSection.Instructor.FirstName + " " + e.CourseSection.Instructor.LastName
                    : null,
                Schedule = e.CourseSection.Schedule,
                Room = e.CourseSection.Room,
                Building = e.CourseSection.Building,
                TermName = e.CourseSection.Term.Name,
                Status = e.Status.ToString(),
                EnrollmentDate = e.EnrollmentDate,
                Grade = e.Grade,
                GradePoints = e.GradePoints,
                IsGradeFinalized = e.IsGradeFinalized
            })
            .ToListAsync(cancellationToken);

        return Result<List<StudentEnrollmentDto>>.Success(enrollments);
    }
}
