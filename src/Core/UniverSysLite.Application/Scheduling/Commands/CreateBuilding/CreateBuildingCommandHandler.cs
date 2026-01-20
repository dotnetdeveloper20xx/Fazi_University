using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities;

namespace UniverSysLite.Application.Scheduling.Commands.CreateBuilding;

public class CreateBuildingCommandHandler : IRequestHandler<CreateBuildingCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;

    public CreateBuildingCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(CreateBuildingCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Buildings
            .AnyAsync(b => b.Code.ToLower() == request.Code.ToLower(), cancellationToken);

        if (exists)
        {
            return Result<Guid>.Failure($"Building with code '{request.Code}' already exists.");
        }

        var building = new Building
        {
            Code = request.Code,
            Name = request.Name,
            Description = request.Description,
            Address = request.Address,
            TotalFloors = request.TotalFloors,
            IsActive = true
        };

        _context.Buildings.Add(building);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(building.Id);
    }
}
