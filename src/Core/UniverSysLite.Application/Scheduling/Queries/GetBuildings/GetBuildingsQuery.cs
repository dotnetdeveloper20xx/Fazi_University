using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Scheduling.DTOs;

namespace UniverSysLite.Application.Scheduling.Queries.GetBuildings;

[Authorize(Permission = "Courses.View")]
public record GetBuildingsQuery : IRequest<Result<PaginatedList<BuildingListDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public bool? IsActive { get; init; }
    public string? SearchTerm { get; init; }
}
