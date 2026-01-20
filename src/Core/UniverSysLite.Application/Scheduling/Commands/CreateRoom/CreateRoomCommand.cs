using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Scheduling.Commands.CreateRoom;

[Authorize(Permission = "Courses.Create")]
public record CreateRoomCommand : IRequest<Result<Guid>>
{
    public Guid BuildingId { get; init; }
    public string RoomNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = "Classroom";
    public int Capacity { get; init; }
    public int? Floor { get; init; }
    public string? Description { get; init; }
    public bool HasProjector { get; init; }
    public bool HasWhiteboard { get; init; }
    public bool HasComputers { get; init; }
    public int? ComputerCount { get; init; }
    public bool IsAccessible { get; init; }
}
