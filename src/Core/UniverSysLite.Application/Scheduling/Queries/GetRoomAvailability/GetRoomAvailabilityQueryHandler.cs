using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Scheduling.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Scheduling.Queries.GetRoomAvailability;

public class GetRoomAvailabilityQueryHandler : IRequestHandler<GetRoomAvailabilityQuery, Result<RoomAvailabilityDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRoomAvailabilityQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RoomAvailabilityDto>> Handle(
        GetRoomAvailabilityQuery request,
        CancellationToken cancellationToken)
    {
        var room = await _context.Rooms
            .Include(r => r.Building)
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken);

        if (room == null)
        {
            throw new NotFoundException("Room", request.RoomId);
        }

        var bookings = await _context.RoomBookings
            .Where(b => b.RoomId == request.RoomId &&
                       b.Date == request.Date &&
                       b.Status != BookingStatus.Cancelled)
            .OrderBy(b => b.StartTime)
            .Select(b => new TimeSlotDto
            {
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                IsBooked = true,
                BookingTitle = b.Title,
                BookingType = b.BookingType.ToString()
            })
            .ToListAsync(cancellationToken);

        // Generate available time slots (8 AM to 10 PM)
        var availableSlots = GenerateAvailableSlots(bookings);

        var result = new RoomAvailabilityDto
        {
            RoomId = room.Id,
            RoomName = $"{room.Building.Code} {room.RoomNumber}",
            Date = request.Date,
            BookedSlots = bookings,
            AvailableSlots = availableSlots,
            IsAvailable = availableSlots.Any()
        };

        return Result<RoomAvailabilityDto>.Success(result);
    }

    private List<TimeSlotDto> GenerateAvailableSlots(List<TimeSlotDto> bookedSlots)
    {
        var availableSlots = new List<TimeSlotDto>();
        var startOfDay = new TimeOnly(8, 0);  // 8 AM
        var endOfDay = new TimeOnly(22, 0);   // 10 PM

        var currentTime = startOfDay;

        foreach (var booking in bookedSlots.OrderBy(b => b.StartTime))
        {
            if (currentTime < booking.StartTime)
            {
                availableSlots.Add(new TimeSlotDto
                {
                    StartTime = currentTime,
                    EndTime = booking.StartTime,
                    IsBooked = false
                });
            }
            currentTime = booking.EndTime > currentTime ? booking.EndTime : currentTime;
        }

        if (currentTime < endOfDay)
        {
            availableSlots.Add(new TimeSlotDto
            {
                StartTime = currentTime,
                EndTime = endOfDay,
                IsBooked = false
            });
        }

        return availableSlots;
    }
}
