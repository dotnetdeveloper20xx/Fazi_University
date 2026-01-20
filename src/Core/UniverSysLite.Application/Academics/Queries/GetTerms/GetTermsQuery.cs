using MediatR;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Queries.GetTerms;

[Authorize(Permission = "Courses.View")]
public record GetTermsQuery : IRequest<Result<PaginatedList<TermListDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public int? AcademicYear { get; init; }
    public string? Type { get; init; }
    public bool? IsCurrent { get; init; }
    public bool? IsActive { get; init; }
    public string? SortBy { get; init; } = "StartDate";
    public bool SortDescending { get; init; } = true;
}
