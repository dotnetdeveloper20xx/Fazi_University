using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Queries.GetPrograms;

public class GetProgramsQueryHandler : IRequestHandler<GetProgramsQuery, Result<PaginatedList<ProgramListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetProgramsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<ProgramListDto>>> Handle(GetProgramsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Programs
            .Include(p => p.Department)
            .AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(p =>
                p.Code.ToLower().Contains(searchTerm) ||
                p.Name.ToLower().Contains(searchTerm));
        }

        // Department filter
        if (request.DepartmentId.HasValue)
        {
            query = query.Where(p => p.DepartmentId == request.DepartmentId.Value);
        }

        // Degree type filter
        if (!string.IsNullOrEmpty(request.DegreeType) &&
            Enum.TryParse<DegreeType>(request.DegreeType, true, out var degreeType))
        {
            query = query.Where(p => p.DegreeType == degreeType);
        }

        // Active filter
        if (request.IsActive.HasValue)
        {
            query = query.Where(p => p.IsActive == request.IsActive.Value);
        }

        // Sorting
        query = request.SortBy?.ToLower() switch
        {
            "code" => request.SortDescending ? query.OrderByDescending(p => p.Code) : query.OrderBy(p => p.Code),
            "name" => request.SortDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "degreetype" => request.SortDescending ? query.OrderByDescending(p => p.DegreeType) : query.OrderBy(p => p.DegreeType),
            "credits" => request.SortDescending ? query.OrderByDescending(p => p.TotalCreditsRequired) : query.OrderBy(p => p.TotalCreditsRequired),
            _ => request.SortDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProgramListDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                DegreeType = p.DegreeType.ToString(),
                DepartmentName = p.Department.Name,
                TotalCreditsRequired = p.TotalCreditsRequired,
                DurationYears = p.DurationYears,
                TuitionPerCredit = p.TuitionPerCredit,
                IsActive = p.IsActive,
                StudentCount = _context.Students.Count(s => s.ProgramId == p.Id && !s.IsDeleted)
            })
            .ToListAsync(cancellationToken);

        var paginatedList = new PaginatedList<ProgramListDto>(
            items, totalCount, request.PageNumber, request.PageSize);

        return Result<PaginatedList<ProgramListDto>>.Success(paginatedList);
    }
}
