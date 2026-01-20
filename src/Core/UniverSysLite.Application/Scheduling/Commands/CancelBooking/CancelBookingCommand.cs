using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Scheduling.Commands.CancelBooking;

[Authorize(Permission = "Courses.Edit")]
public record CancelBookingCommand : IRequest<Result<bool>>
{
    public Guid BookingId { get; init; }
    public string? CancellationReason { get; init; }
}
