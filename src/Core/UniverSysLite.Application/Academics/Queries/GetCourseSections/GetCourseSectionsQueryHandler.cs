using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.Application.Academics.Queries.GetCourseSections;

public class GetCourseSectionsQueryHandler : IRequestHandler<GetCourseSectionsQuery, Result<PaginatedList<CourseSectionListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetCourseSectionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<CourseSectionListDto>>> Handle(GetCourseSectionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CourseSections
            .Include(cs => cs.Course)
            .Include(cs => cs.Instructor)
            .Where(cs => !cs.IsDeleted)
            .AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(cs =>
                cs.Course.Code.ToLower().Contains(searchTerm) ||
                cs.Course.Name.ToLower().Contains(searchTerm) ||
                cs.SectionNumber.ToLower().Contains(searchTerm));
        }

        // Course filter
        if (request.CourseId.HasValue)
        {
            query = query.Where(cs => cs.CourseId == request.CourseId.Value);
        }

        // Term filter
        if (request.TermId.HasValue)
        {
            query = query.Where(cs => cs.TermId == request.TermId.Value);
        }

        // Instructor filter
        if (request.InstructorId.HasValue)
        {
            query = query.Where(cs => cs.InstructorId == request.InstructorId.Value);
        }

        // Open filter
        if (request.IsOpen.HasValue)
        {
            query = query.Where(cs => cs.IsOpen == request.IsOpen.Value);
        }

        // Available seats filter
        if (request.HasAvailableSeats == true)
        {
            query = query.Where(cs => cs.CurrentEnrollment < cs.MaxEnrollment);
        }

        // Sorting
        query = request.SortBy?.ToLower() switch
        {
            "coursecode" => request.SortDescending ? query.OrderByDescending(cs => cs.Course.Code) : query.OrderBy(cs => cs.Course.Code),
            "coursename" => request.SortDescending ? query.OrderByDescending(cs => cs.Course.Name) : query.OrderBy(cs => cs.Course.Name),
            "section" => request.SortDescending ? query.OrderByDescending(cs => cs.SectionNumber) : query.OrderBy(cs => cs.SectionNumber),
            "enrollment" => request.SortDescending ? query.OrderByDescending(cs => cs.CurrentEnrollment) : query.OrderBy(cs => cs.CurrentEnrollment),
            _ => request.SortDescending ? query.OrderByDescending(cs => cs.Course.Code) : query.OrderBy(cs => cs.Course.Code)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(cs => new CourseSectionListDto
            {
                Id = cs.Id,
                CourseCode = cs.Course.Code,
                CourseName = cs.Course.Name,
                SectionNumber = cs.SectionNumber,
                InstructorName = cs.Instructor != null ? cs.Instructor.FirstName + " " + cs.Instructor.LastName : null,
                MaxEnrollment = cs.MaxEnrollment,
                CurrentEnrollment = cs.CurrentEnrollment,
                AvailableSeats = cs.MaxEnrollment - cs.CurrentEnrollment,
                Schedule = cs.Schedule,
                Room = cs.Room,
                IsOpen = cs.IsOpen,
                IsCancelled = cs.IsCancelled
            })
            .ToListAsync(cancellationToken);

        var paginatedList = new PaginatedList<CourseSectionListDto>(
            items, totalCount, request.PageNumber, request.PageSize);

        return Result<PaginatedList<CourseSectionListDto>>.Success(paginatedList);
    }
}
