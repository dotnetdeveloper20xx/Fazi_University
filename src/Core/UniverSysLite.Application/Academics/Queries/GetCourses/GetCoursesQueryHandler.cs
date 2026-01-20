using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Queries.GetCourses;

public class GetCoursesQueryHandler : IRequestHandler<GetCoursesQuery, Result<PaginatedList<CourseListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetCoursesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<CourseListDto>>> Handle(GetCoursesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Courses
            .Include(c => c.Department)
            .AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(c =>
                c.Code.ToLower().Contains(searchTerm) ||
                c.Name.ToLower().Contains(searchTerm));
        }

        // Department filter
        if (request.DepartmentId.HasValue)
        {
            query = query.Where(c => c.DepartmentId == request.DepartmentId.Value);
        }

        // Level filter
        if (!string.IsNullOrEmpty(request.Level) &&
            Enum.TryParse<CourseLevel>(request.Level, true, out var level))
        {
            query = query.Where(c => c.Level == level);
        }

        // Active filter
        if (request.IsActive.HasValue)
        {
            query = query.Where(c => c.IsActive == request.IsActive.Value);
        }

        // Sorting
        query = request.SortBy?.ToLower() switch
        {
            "code" => request.SortDescending ? query.OrderByDescending(c => c.Code) : query.OrderBy(c => c.Code),
            "name" => request.SortDescending ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name),
            "credits" => request.SortDescending ? query.OrderByDescending(c => c.CreditHours) : query.OrderBy(c => c.CreditHours),
            "level" => request.SortDescending ? query.OrderByDescending(c => c.Level) : query.OrderBy(c => c.Level),
            _ => request.SortDescending ? query.OrderByDescending(c => c.Code) : query.OrderBy(c => c.Code)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CourseListDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                DepartmentName = c.Department.Name,
                CreditHours = c.CreditHours,
                Level = c.Level.ToString(),
                IsActive = c.IsActive,
                SectionCount = c.Sections.Count(s => !s.IsDeleted)
            })
            .ToListAsync(cancellationToken);

        var paginatedList = new PaginatedList<CourseListDto>(
            items, totalCount, request.PageNumber, request.PageSize);

        return Result<PaginatedList<CourseListDto>>.Success(paginatedList);
    }
}
