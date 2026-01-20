using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Users.DTOs;
using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Application.Users.Queries.GetUsers;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, Result<PaginatedList<UserListDto>>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IApplicationDbContext _context;

    public GetUsersQueryHandler(UserManager<ApplicationUser> userManager, IApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<Result<PaginatedList<UserListDto>>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _userManager.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.Profile)
            .AsQueryable();

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(u =>
                u.Email!.ToLower().Contains(searchTerm) ||
                u.FirstName.ToLower().Contains(searchTerm) ||
                u.LastName.ToLower().Contains(searchTerm) ||
                (u.DisplayName != null && u.DisplayName.ToLower().Contains(searchTerm)));
        }

        // Apply role filter
        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name == request.Role));
        }

        // Apply active filter
        if (request.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == request.IsActive.Value);
        }

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "email" => request.SortDescending
                ? query.OrderByDescending(u => u.Email)
                : query.OrderBy(u => u.Email),
            "firstname" => request.SortDescending
                ? query.OrderByDescending(u => u.FirstName)
                : query.OrderBy(u => u.FirstName),
            "lastname" => request.SortDescending
                ? query.OrderByDescending(u => u.LastName)
                : query.OrderBy(u => u.LastName),
            "lastloginat" => request.SortDescending
                ? query.OrderByDescending(u => u.LastLoginAt)
                : query.OrderBy(u => u.LastLoginAt),
            _ => request.SortDescending
                ? query.OrderByDescending(u => u.CreatedAt)
                : query.OrderBy(u => u.CreatedAt)
        };

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var users = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Map to DTOs
        var userDtos = users.Select(u => new UserListDto
        {
            Id = u.Id,
            Email = u.Email ?? string.Empty,
            FirstName = u.FirstName,
            LastName = u.LastName,
            FullName = u.FullName,
            DisplayName = u.DisplayName,
            AvatarUrl = u.Profile?.AvatarUrl,
            IsActive = u.IsActive,
            EmailConfirmed = u.EmailConfirmed,
            LastLoginAt = u.LastLoginAt,
            CreatedAt = u.CreatedAt,
            Roles = u.UserRoles.Select(ur => ur.Role.Name ?? string.Empty).ToList()
        }).ToList();

        var paginatedList = new PaginatedList<UserListDto>(
            userDtos,
            totalCount,
            request.PageNumber,
            request.PageSize);

        return Result<PaginatedList<UserListDto>>.Success(paginatedList);
    }
}
