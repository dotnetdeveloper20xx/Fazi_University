using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Scheduling.Commands.CreateRoom;

public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;

    public CreateRoomCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        var building = await _context.Buildings
            .FirstOrDefaultAsync(b => b.Id == request.BuildingId, cancellationToken);

        if (building == null)
        {
            throw new NotFoundException("Building", request.BuildingId);
        }

        var exists = await _context.Rooms
            .AnyAsync(r => r.BuildingId == request.BuildingId &&
                          r.RoomNumber.ToLower() == request.RoomNumber.ToLower(), cancellationToken);

        if (exists)
        {
            return Result<Guid>.Failure($"Room '{request.RoomNumber}' already exists in building '{building.Name}'.");
        }

        if (!Enum.TryParse<RoomType>(request.Type, true, out var roomType))
        {
            roomType = RoomType.Classroom;
        }

        var room = new Room
        {
            BuildingId = request.BuildingId,
            RoomNumber = request.RoomNumber,
            Name = request.Name,
            Type = roomType,
            Capacity = request.Capacity,
            Floor = request.Floor,
            Description = request.Description,
            HasProjector = request.HasProjector,
            HasWhiteboard = request.HasWhiteboard,
            HasComputers = request.HasComputers,
            ComputerCount = request.ComputerCount,
            IsAccessible = request.IsAccessible,
            IsActive = true
        };

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(room.Id);
    }
}
