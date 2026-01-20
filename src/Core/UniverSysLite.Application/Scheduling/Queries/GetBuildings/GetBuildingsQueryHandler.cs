using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Scheduling.DTOs;

namespace UniverSysLite.Application.Scheduling.Queries.GetBuildings;

public class GetBuildingsQueryHandler : IRequestHandler<GetBuildingsQuery, Result<PaginatedList<BuildingListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetBuildingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<BuildingListDto>>> Handle(
        GetBuildingsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Buildings
            .Include(b => b.Rooms)
            .AsQueryable();

        if (request.IsActive.HasValue)
        {
            query = query.Where(b => b.IsActive == request.IsActive.Value);
        }

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(b =>
                b.Code.ToLower().Contains(searchTerm) ||
                b.Name.ToLower().Contains(searchTerm));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var buildings = await query
            .OrderBy(b => b.Code)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(b => new BuildingListDto
            {
                Id = b.Id,
                Code = b.Code,
                Name = b.Name,
                Address = b.Address,
                TotalFloors = b.TotalFloors,
                RoomCount = b.Rooms.Count(r => !r.IsDeleted),
                ActiveRoomCount = b.Rooms.Count(r => !r.IsDeleted && r.IsActive),
                IsActive = b.IsActive
            })
            .ToListAsync(cancellationToken);

        var result = new PaginatedList<BuildingListDto>(buildings, totalCount, request.PageNumber, request.PageSize);
        return Result<PaginatedList<BuildingListDto>>.Success(result);
    }
}
