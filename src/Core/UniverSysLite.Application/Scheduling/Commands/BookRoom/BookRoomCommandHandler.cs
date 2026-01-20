using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Scheduling.Commands.BookRoom;

public class BookRoomCommandHandler : IRequestHandler<BookRoomCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public BookRoomCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Guid>> Handle(BookRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _context.Rooms
            .Include(r => r.Building)
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken);

        if (room == null)
        {
            throw new NotFoundException("Room", request.RoomId);
        }

        if (!room.IsActive)
        {
            return Result<Guid>.Failure("This room is not available for booking.");
        }

        // Check for conflicts
        var conflictingBooking = await _context.RoomBookings
            .Where(b => b.RoomId == request.RoomId &&
                       b.Date == request.Date &&
                       b.Status != BookingStatus.Cancelled &&
                       ((b.StartTime < request.EndTime && b.EndTime > request.StartTime)))
            .FirstOrDefaultAsync(cancellationToken);

        if (conflictingBooking != null)
        {
            return Result<Guid>.Failure(
                $"Room is already booked from {conflictingBooking.StartTime:HH:mm} to {conflictingBooking.EndTime:HH:mm} " +
                $"for '{conflictingBooking.Title}'.");
        }

        if (!Enum.TryParse<BookingType>(request.BookingType, true, out var bookingType))
        {
            bookingType = BookingType.Class;
        }

        var booking = new RoomBooking
        {
            RoomId = request.RoomId,
            CourseSectionId = request.CourseSectionId,
            BookedById = _currentUserService.UserId,
            Title = request.Title,
            Description = request.Description,
            BookingType = bookingType,
            Date = request.Date,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            IsRecurring = request.IsRecurring,
            RecurrencePattern = request.RecurrencePattern,
            RecurrenceEndDate = request.RecurrenceEndDate,
            Status = BookingStatus.Confirmed
        };

        _context.RoomBookings.Add(booking);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(booking.Id);
    }
}
