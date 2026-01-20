using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Users.DTOs;
using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Application.Users.Queries.GetUserById;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, Result<UserDetailDto>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IApplicationDbContext _context;

    public GetUserByIdQueryHandler(UserManager<ApplicationUser> userManager, IApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<Result<UserDetailDto>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .Include(u => u.Profile)
            .Include(u => u.Settings)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("User", request.UserId);
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name ?? string.Empty).ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        var userDto = new UserDetailDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            UserName = user.UserName,
            FirstName = user.FirstName,
            LastName = user.LastName,
            DisplayName = user.DisplayName,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            EmailConfirmed = user.EmailConfirmed,
            PhoneNumberConfirmed = user.PhoneNumberConfirmed,
            TwoFactorEnabled = user.TwoFactorEnabled,
            IsActive = user.IsActive,
            MustChangePassword = user.MustChangePassword,
            LastLoginAt = user.LastLoginAt,
            LastLoginIp = user.LastLoginIp,
            CreatedAt = user.CreatedAt,
            ModifiedAt = user.ModifiedAt,
            Roles = roles,
            Permissions = permissions,
            Profile = user.Profile != null ? new UserProfileDto
            {
                Id = user.Profile.Id,
                AvatarUrl = user.Profile.AvatarUrl,
                Bio = user.Profile.Bio,
                JobTitle = user.Profile.JobTitle,
                Department = user.Profile.Department,
                Location = user.Profile.Location,
                PhoneNumber = user.Profile.PhoneNumber,
                DateOfBirth = user.Profile.DateOfBirth,
                Visibility = user.Profile.Visibility.ToString()
            } : null,
            Settings = user.Settings != null ? new UserSettingsDto
            {
                Id = user.Settings.Id,
                Theme = user.Settings.Theme.ToString(),
                Density = user.Settings.Density.ToString(),
                FontSize = user.Settings.FontSize.ToString(),
                AccentColor = user.Settings.AccentColor,
                HighContrastMode = user.Settings.HighContrastMode,
                ReducedMotion = user.Settings.ReducedMotion,
                Language = user.Settings.Language,
                Timezone = user.Settings.Timezone,
                DateFormat = user.Settings.DateFormat,
                TimeFormat = user.Settings.TimeFormat,
                EmailNotifications = user.Settings.EmailNotifications,
                PushNotifications = user.Settings.PushNotifications,
                InAppNotifications = user.Settings.InAppNotifications,
                DigestFrequency = user.Settings.DigestFrequency.ToString()
            } : null
        };

        return Result<UserDetailDto>.Success(userDto);
    }
}
