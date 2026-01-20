using MediatR;
using Microsoft.AspNetCore.Identity;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Users.Commands.CreateUser;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<Guid>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public CreateUserCommandHandler(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result<Guid>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        // Check if email already exists
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result<Guid>.Failure("A user with this email already exists.");
        }

        // Validate roles exist
        foreach (var roleName in request.Roles)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                return Result<Guid>.Failure($"Role '{roleName}' does not exist.");
            }
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName ?? string.Empty,
            LastName = request.LastName ?? string.Empty,
            PhoneNumber = request.PhoneNumber,
            IsActive = request.IsActive,
            EmailConfirmed = request.EmailConfirmed,
            MustChangePassword = request.MustChangePassword,
            CreatedAt = _dateTimeService.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return Result<Guid>.Failure(result.Errors.Select(e => e.Description));
        }

        // Assign roles
        foreach (var roleName in request.Roles)
        {
            await _userManager.AddToRoleAsync(user, roleName);
        }

        // Create user profile
        var profile = new UserProfile
        {
            UserId = user.Id,
            Visibility = ProfileVisibility.Internal
        };
        _context.UserProfiles.Add(profile);

        // Create user settings
        var settings = new UserSettings
        {
            UserId = user.Id,
            Theme = ThemeMode.System,
            Density = UiDensity.Comfortable,
            FontSize = FontSize.Medium,
            EmailNotifications = true,
            InAppNotifications = true,
            DigestFrequency = DigestFrequency.Daily,
            Language = "en-US",
            Timezone = "UTC"
        };
        _context.UserSettings.Add(settings);

        // Store password in history
        var passwordHistory = new PasswordHistory
        {
            UserId = user.Id,
            PasswordHash = user.PasswordHash!,
            CreatedAt = _dateTimeService.UtcNow
        };
        _context.PasswordHistories.Add(passwordHistory);

        await _context.SaveChangesAsync(cancellationToken);

        // Audit log
        await _auditService.LogAsync(
            AuditAction.Created,
            "User",
            user.Id.ToString(),
            $"User {user.Email} created with roles: {string.Join(", ", request.Roles)}",
            newValues: new { user.Email, user.FirstName, user.LastName, request.Roles },
            cancellationToken: cancellationToken);

        return Result<Guid>.Success(user.Id);
    }
}
