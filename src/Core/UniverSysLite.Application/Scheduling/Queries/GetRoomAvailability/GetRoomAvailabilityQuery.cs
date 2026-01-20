using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Scheduling.DTOs;

namespace UniverSysLite.Application.Scheduling.Queries.GetRoomAvailability;

[Authorize(Permission = "Courses.View")]
public record GetRoomAvailabilityQuery : IRequest<Result<RoomAvailabilityDto>>
{
    public Guid RoomId { get; init; }
    public DateOnly Date { get; init; }
}
