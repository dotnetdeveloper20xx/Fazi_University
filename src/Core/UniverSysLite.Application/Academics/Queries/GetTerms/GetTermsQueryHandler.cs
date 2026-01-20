using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Queries.GetTerms;

public class GetTermsQueryHandler : IRequestHandler<GetTermsQuery, Result<PaginatedList<TermListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetTermsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<TermListDto>>> Handle(GetTermsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Terms.AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(t =>
                t.Code.ToLower().Contains(searchTerm) ||
                t.Name.ToLower().Contains(searchTerm));
        }

        // Academic year filter
        if (request.AcademicYear.HasValue)
        {
            query = query.Where(t => t.AcademicYear == request.AcademicYear.Value);
        }

        // Type filter
        if (!string.IsNullOrEmpty(request.Type) &&
            Enum.TryParse<TermType>(request.Type, true, out var termType))
        {
            query = query.Where(t => t.Type == termType);
        }

        // Current filter
        if (request.IsCurrent.HasValue)
        {
            query = query.Where(t => t.IsCurrent == request.IsCurrent.Value);
        }

        // Active filter
        if (request.IsActive.HasValue)
        {
            query = query.Where(t => t.IsActive == request.IsActive.Value);
        }

        // Sorting
        query = request.SortBy?.ToLower() switch
        {
            "code" => request.SortDescending ? query.OrderByDescending(t => t.Code) : query.OrderBy(t => t.Code),
            "name" => request.SortDescending ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name),
            "academicyear" => request.SortDescending ? query.OrderByDescending(t => t.AcademicYear) : query.OrderBy(t => t.AcademicYear),
            "startdate" => request.SortDescending ? query.OrderByDescending(t => t.StartDate) : query.OrderBy(t => t.StartDate),
            _ => request.SortDescending ? query.OrderByDescending(t => t.StartDate) : query.OrderBy(t => t.StartDate)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => new TermListDto
            {
                Id = t.Id,
                Code = t.Code,
                Name = t.Name,
                Type = t.Type.ToString(),
                AcademicYear = t.AcademicYear,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                IsCurrent = t.IsCurrent,
                IsActive = t.IsActive,
                SectionCount = t.Sections.Count(s => !s.IsDeleted)
            })
            .ToListAsync(cancellationToken);

        var paginatedList = new PaginatedList<TermListDto>(
            items, totalCount, request.PageNumber, request.PageSize);

        return Result<PaginatedList<TermListDto>>.Success(paginatedList);
    }
}
