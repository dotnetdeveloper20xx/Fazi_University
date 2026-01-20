using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.Application.Academics.Queries.GetDepartments;

public class GetDepartmentsQueryHandler : IRequestHandler<GetDepartmentsQuery, Result<PaginatedList<DepartmentListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetDepartmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<DepartmentListDto>>> Handle(GetDepartmentsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Departments.AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(d =>
                d.Code.ToLower().Contains(searchTerm) ||
                d.Name.ToLower().Contains(searchTerm) ||
                (d.Email != null && d.Email.ToLower().Contains(searchTerm)));
        }

        // Active filter
        if (request.IsActive.HasValue)
        {
            query = query.Where(d => d.IsActive == request.IsActive.Value);
        }

        // Sorting
        query = request.SortBy?.ToLower() switch
        {
            "code" => request.SortDescending ? query.OrderByDescending(d => d.Code) : query.OrderBy(d => d.Code),
            "name" => request.SortDescending ? query.OrderByDescending(d => d.Name) : query.OrderBy(d => d.Name),
            "createdat" => request.SortDescending ? query.OrderByDescending(d => d.CreatedAt) : query.OrderBy(d => d.CreatedAt),
            _ => request.SortDescending ? query.OrderByDescending(d => d.Name) : query.OrderBy(d => d.Name)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(d => new DepartmentListDto
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name,
                HeadOfDepartmentName = d.HeadOfDepartmentId != null ?
                    _context.Users.Where(u => u.Id == d.HeadOfDepartmentId).Select(u => u.FirstName + " " + u.LastName).FirstOrDefault() : null,
                Phone = d.Phone,
                Email = d.Email,
                IsActive = d.IsActive,
                ProgramCount = d.Programs.Count(p => !p.IsDeleted),
                CourseCount = d.Courses.Count(c => !c.IsDeleted)
            })
            .ToListAsync(cancellationToken);

        var paginatedList = new PaginatedList<DepartmentListDto>(
            items, totalCount, request.PageNumber, request.PageSize);

        return Result<PaginatedList<DepartmentListDto>>.Success(paginatedList);
    }
}
