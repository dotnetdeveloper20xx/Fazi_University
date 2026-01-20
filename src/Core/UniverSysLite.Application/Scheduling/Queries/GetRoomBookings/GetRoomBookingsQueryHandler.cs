using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Scheduling.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Scheduling.Queries.GetRoomBookings;

public class GetRoomBookingsQueryHandler : IRequestHandler<GetRoomBookingsQuery, Result<PaginatedList<RoomBookingDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetRoomBookingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<RoomBookingDto>>> Handle(
        GetRoomBookingsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.RoomBookings
            .Include(b => b.Room)
                .ThenInclude(r => r.Building)
            .Include(b => b.BookedBy)
            .AsQueryable();

        if (request.RoomId.HasValue)
        {
            query = query.Where(b => b.RoomId == request.RoomId.Value);
        }

        if (request.BuildingId.HasValue)
        {
            query = query.Where(b => b.Room.BuildingId == request.BuildingId.Value);
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(b => b.Date >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(b => b.Date <= request.EndDate.Value);
        }

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<BookingStatus>(request.Status, true, out var status))
        {
            query = query.Where(b => b.Status == status);
        }

        if (!string.IsNullOrEmpty(request.BookingType) && Enum.TryParse<BookingType>(request.BookingType, true, out var bookingType))
        {
            query = query.Where(b => b.BookingType == bookingType);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var bookings = await query
            .OrderByDescending(b => b.Date)
            .ThenBy(b => b.StartTime)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(b => new RoomBookingDto
            {
                Id = b.Id,
                RoomId = b.RoomId,
                RoomName = $"{b.Room.Building.Code} {b.Room.RoomNumber}",
                BuildingName = b.Room.Building.Name,
                CourseSectionId = b.CourseSectionId,
                BookedById = b.BookedById,
                BookedByName = b.BookedBy != null ? $"{b.BookedBy.FirstName} {b.BookedBy.LastName}" : null,
                Title = b.Title,
                Description = b.Description,
                BookingType = b.BookingType.ToString(),
                Date = b.Date,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                IsRecurring = b.IsRecurring,
                RecurrencePattern = b.RecurrencePattern,
                RecurrenceEndDate = b.RecurrenceEndDate,
                Status = b.Status.ToString()
            })
            .ToListAsync(cancellationToken);

        var result = new PaginatedList<RoomBookingDto>(bookings, totalCount, request.PageNumber, request.PageSize);
        return Result<PaginatedList<RoomBookingDto>>.Success(result);
    }
}
