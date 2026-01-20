using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Scheduling.Commands.CreateBuilding;

[Authorize(Permission = "Courses.Create")]
public record CreateBuildingCommand : IRequest<Result<Guid>>
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Address { get; init; }
    public int? TotalFloors { get; init; }
}
