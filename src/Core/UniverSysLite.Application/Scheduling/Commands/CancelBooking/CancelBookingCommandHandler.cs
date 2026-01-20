using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Scheduling.Commands.CancelBooking;

public class CancelBookingCommandHandler : IRequestHandler<CancelBookingCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CancelBookingCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<bool>> Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _context.RoomBookings
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

        if (booking == null)
        {
            throw new NotFoundException("Room Booking", request.BookingId);
        }

        if (booking.Status == BookingStatus.Cancelled)
        {
            return Result<bool>.Failure("This booking has already been cancelled.");
        }

        if (booking.Date < DateOnly.FromDateTime(DateTime.UtcNow))
        {
            return Result<bool>.Failure("Cannot cancel a booking in the past.");
        }

        booking.Status = BookingStatus.Cancelled;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
