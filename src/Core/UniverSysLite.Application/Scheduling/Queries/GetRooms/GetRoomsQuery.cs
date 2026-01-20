using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Scheduling.DTOs;

namespace UniverSysLite.Application.Scheduling.Queries.GetRooms;

[Authorize(Permission = "Courses.View")]
public record GetRoomsQuery : IRequest<Result<PaginatedList<RoomListDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public Guid? BuildingId { get; init; }
    public string? Type { get; init; }
    public int? MinCapacity { get; init; }
    public bool? HasProjector { get; init; }
    public bool? HasComputers { get; init; }
    public bool? IsAccessible { get; init; }
    public bool? IsActive { get; init; }
}
