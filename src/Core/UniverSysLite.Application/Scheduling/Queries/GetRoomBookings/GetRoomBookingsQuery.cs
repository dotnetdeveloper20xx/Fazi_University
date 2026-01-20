using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Scheduling.DTOs;

namespace UniverSysLite.Application.Scheduling.Queries.GetRoomBookings;

[Authorize(Permission = "Courses.View")]
public record GetRoomBookingsQuery : IRequest<Result<PaginatedList<RoomBookingDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public Guid? RoomId { get; init; }
    public Guid? BuildingId { get; init; }
    public DateOnly? StartDate { get; init; }
    public DateOnly? EndDate { get; init; }
    public string? Status { get; init; }
    public string? BookingType { get; init; }
}
