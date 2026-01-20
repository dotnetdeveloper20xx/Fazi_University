using MediatR;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Queries.GetPrograms;

[Authorize(Permission = "Courses.View")]
public record GetProgramsQuery : IRequest<Result<PaginatedList<ProgramListDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public Guid? DepartmentId { get; init; }
    public string? DegreeType { get; init; }
    public bool? IsActive { get; init; }
    public string? SortBy { get; init; } = "Name";
    public bool SortDescending { get; init; } = false;
}
