using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Enrollments.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Enrollments.Queries.GetEnrollments;

public class GetEnrollmentsQueryHandler : IRequestHandler<GetEnrollmentsQuery, Result<PaginatedList<EnrollmentListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetEnrollmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<EnrollmentListDto>>> Handle(
        GetEnrollmentsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Term)
            .AsQueryable();

        // Apply filters
        if (request.StudentId.HasValue)
        {
            query = query.Where(e => e.StudentId == request.StudentId.Value);
        }

        if (request.CourseSectionId.HasValue)
        {
            query = query.Where(e => e.CourseSectionId == request.CourseSectionId.Value);
        }

        if (request.CourseId.HasValue)
        {
            query = query.Where(e => e.CourseSection.CourseId == request.CourseId.Value);
        }

        if (request.TermId.HasValue)
        {
            query = query.Where(e => e.CourseSection.TermId == request.TermId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Status) &&
            Enum.TryParse<EnrollmentStatus>(request.Status, true, out var status))
        {
            query = query.Where(e => e.Status == status);
        }

        if (request.IsGradeFinalized.HasValue)
        {
            query = query.Where(e => e.IsGradeFinalized == request.IsGradeFinalized.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(e =>
                e.Student.StudentId.ToLower().Contains(searchTerm) ||
                (e.Student.User != null && e.Student.User.FirstName.ToLower().Contains(searchTerm)) ||
                (e.Student.User != null && e.Student.User.LastName.ToLower().Contains(searchTerm)) ||
                e.CourseSection.Course.Code.ToLower().Contains(searchTerm) ||
                e.CourseSection.Course.Name.ToLower().Contains(searchTerm));
        }

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "studentid" => request.SortDescending
                ? query.OrderByDescending(e => e.Student.StudentId)
                : query.OrderBy(e => e.Student.StudentId),
            "studentname" => request.SortDescending
                ? query.OrderByDescending(e => e.Student.User!.LastName).ThenByDescending(e => e.Student.User!.FirstName)
                : query.OrderBy(e => e.Student.User!.LastName).ThenBy(e => e.Student.User!.FirstName),
            "coursecode" => request.SortDescending
                ? query.OrderByDescending(e => e.CourseSection.Course.Code)
                : query.OrderBy(e => e.CourseSection.Course.Code),
            "status" => request.SortDescending
                ? query.OrderByDescending(e => e.Status)
                : query.OrderBy(e => e.Status),
            "grade" => request.SortDescending
                ? query.OrderByDescending(e => e.Grade)
                : query.OrderBy(e => e.Grade),
            _ => request.SortDescending
                ? query.OrderByDescending(e => e.EnrollmentDate)
                : query.OrderBy(e => e.EnrollmentDate)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new EnrollmentListDto
            {
                Id = e.Id,
                StudentId_Display = e.Student.StudentId,
                StudentName = e.Student.User != null ? e.Student.User.FirstName + " " + e.Student.User.LastName : "",
                CourseCode = e.CourseSection.Course.Code,
                CourseName = e.CourseSection.Course.Name,
                SectionNumber = e.CourseSection.SectionNumber,
                TermName = e.CourseSection.Term != null ? e.CourseSection.Term.Name : "",
                Status = e.Status.ToString(),
                EnrollmentDate = e.EnrollmentDate,
                Grade = e.Grade,
                IsGradeFinalized = e.IsGradeFinalized
            })
            .ToListAsync(cancellationToken);

        var paginatedList = new PaginatedList<EnrollmentListDto>(
            items, totalCount, request.PageNumber, request.PageSize);

        return Result<PaginatedList<EnrollmentListDto>>.Success(paginatedList);
    }
}
