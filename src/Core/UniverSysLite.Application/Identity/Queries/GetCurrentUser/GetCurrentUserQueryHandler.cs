using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Identity.DTOs;
using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Application.Identity.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, Result<UserDto>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public GetCurrentUserQueryHandler(
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<UserDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
        {
            return Result<UserDto>.Failure("User not authenticated.");
        }

        var user = await _userManager.FindByIdAsync(userId.Value.ToString());
        if (user == null)
        {
            return Result<UserDto>.Failure("User not found.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var permissions = await GetUserPermissionsAsync(user.Id, cancellationToken);

        return Result<UserDto>.Success(new UserDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            EmailConfirmed = user.EmailConfirmed,
            PhoneNumberConfirmed = user.PhoneNumberConfirmed,
            TwoFactorEnabled = user.TwoFactorEnabled,
            IsActive = user.IsActive,
            LockoutEnd = user.LockoutEnd,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            Roles = roles,
            Permissions = permissions
        });
    }

    private async Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var userRoleIds = await _context.Users
            .Where(u => u.Id == userId)
            .SelectMany(u => u.UserRoles)
            .Select(ur => ur.RoleId)
            .ToListAsync(cancellationToken);

        return await _context.RolePermissions
            .Where(rp => userRoleIds.Contains(rp.RoleId))
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToListAsync(cancellationToken);
    }
}
