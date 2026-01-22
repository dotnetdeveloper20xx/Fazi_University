using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Scheduling.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Scheduling.Queries.GetRooms;

public class GetRoomsQueryHandler : IRequestHandler<GetRoomsQuery, Result<PaginatedList<RoomListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetRoomsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<RoomListDto>>> Handle(
        GetRoomsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Rooms
            .AsNoTracking()
            .Where(r => !r.IsDeleted)
            .AsQueryable();

        if (request.BuildingId.HasValue)
        {
            query = query.Where(r => r.BuildingId == request.BuildingId.Value);
        }

        if (!string.IsNullOrEmpty(request.Type) && Enum.TryParse<RoomType>(request.Type, true, out var roomType))
        {
            query = query.Where(r => r.Type == roomType);
        }

        if (request.MinCapacity.HasValue)
        {
            query = query.Where(r => r.Capacity >= request.MinCapacity.Value);
        }

        if (request.HasProjector.HasValue)
        {
            query = query.Where(r => r.HasProjector == request.HasProjector.Value);
        }

        if (request.HasComputers.HasValue)
        {
            query = query.Where(r => r.HasComputers == request.HasComputers.Value);
        }

        if (request.IsAccessible.HasValue)
        {
            query = query.Where(r => r.IsAccessible == request.IsAccessible.Value);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(r => r.IsActive == request.IsActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Project first, then order in memory to avoid EF Core translation issues
        var roomData = await query
            .Select(r => new
            {
                r.Id,
                BuildingCode = r.Building.Code,
                BuildingName = r.Building.Name,
                r.RoomNumber,
                r.Name,
                r.Type,
                r.Capacity,
                r.Floor,
                r.IsActive,
                r.HasProjector,
                r.HasWhiteboard,
                r.HasComputers,
                r.ComputerCount,
                r.IsAccessible
            })
            .ToListAsync(cancellationToken);

        var rooms = roomData
            .OrderBy(r => r.BuildingCode)
            .ThenBy(r => r.RoomNumber)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new RoomListDto
            {
                Id = r.Id,
                BuildingCode = r.BuildingCode,
                BuildingName = r.BuildingName,
                RoomNumber = r.RoomNumber,
                Name = r.Name,
                Type = r.Type.ToString(),
                Capacity = r.Capacity,
                Floor = r.Floor,
                IsActive = r.IsActive,
                Features = string.Join(", ", new[]
                {
                    r.HasProjector ? "Projector" : null,
                    r.HasWhiteboard ? "Whiteboard" : null,
                    r.HasComputers ? $"Computers ({r.ComputerCount ?? 0})" : null,
                    r.IsAccessible ? "Accessible" : null
                }.Where(f => f != null))
            }).ToList();

        var result = new PaginatedList<RoomListDto>(rooms, totalCount, request.PageNumber, request.PageSize);
        return Result<PaginatedList<RoomListDto>>.Success(result);
    }
}
