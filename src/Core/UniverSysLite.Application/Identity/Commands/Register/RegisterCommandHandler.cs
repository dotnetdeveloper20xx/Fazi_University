using MediatR;
using Microsoft.AspNetCore.Identity;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Application.Identity.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<Guid>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IEmailService _emailService;

    public RegisterCommandHandler(
        UserManager<ApplicationUser> userManager,
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IEmailService emailService)
    {
        _userManager = userManager;
        _context = context;
        _dateTimeService = dateTimeService;
        _emailService = emailService;
    }

    public async Task<Result<Guid>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // Check if email already exists
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result<Guid>.Failure("An account with this email already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName ?? "",
            LastName = request.LastName ?? "",
            PhoneNumber = request.PhoneNumber,
            IsActive = true,
            CreatedAt = _dateTimeService.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return Result<Guid>.Failure(result.Errors.Select(e => e.Description));
        }

        // Create user profile
        var profile = new UserProfile
        {
            UserId = user.Id,
            Visibility = Domain.Enums.ProfileVisibility.Internal
        };
        _context.UserProfiles.Add(profile);

        // Create user settings with defaults
        var settings = new UserSettings
        {
            UserId = user.Id,
            Theme = Domain.Enums.ThemeMode.System,
            Density = Domain.Enums.UiDensity.Comfortable,
            FontSize = Domain.Enums.FontSize.Medium,
            EmailNotifications = true,
            DigestFrequency = Domain.Enums.DigestFrequency.Daily,
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

        // Assign default role (Student for new registrations)
        await _userManager.AddToRoleAsync(user, "Student");

        await _context.SaveChangesAsync(cancellationToken);

        // Send welcome email
        await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName ?? user.UserName!, cancellationToken);

        return Result<Guid>.Success(user.Id);
    }
}
