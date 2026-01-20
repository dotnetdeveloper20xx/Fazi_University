using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.UserPreferences.Commands.UpdateUserSettings;

public class UpdateUserSettingsCommandHandler : IRequestHandler<UpdateUserSettingsCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public UpdateUserSettingsCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(UpdateUserSettingsCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (!userId.HasValue || userId == Guid.Empty)
        {
            return Result.Failure("User not authenticated.");
        }

        var settings = await _context.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId.Value, cancellationToken);

        if (settings == null)
        {
            throw new NotFoundException("UserSettings", userId.Value);
        }

        // Capture old values for audit
        var oldValues = new
        {
            Theme = settings.Theme.ToString(),
            settings.AccentColor,
            Density = settings.Density.ToString(),
            settings.Language,
            settings.DateFormat,
            settings.TimeFormat,
            settings.Timezone,
            settings.HighContrastMode,
            settings.ReducedMotion,
            FontSize = settings.FontSize.ToString(),
            settings.EmailNotifications,
            settings.PushNotifications,
            settings.InAppNotifications,
            DigestFrequency = settings.DigestFrequency.ToString()
        };

        // Update Theme settings
        if (!string.IsNullOrEmpty(request.Theme) &&
            Enum.TryParse<ThemeMode>(request.Theme, true, out var theme))
        {
            settings.Theme = theme;
        }

        if (request.AccentColor != null)
            settings.AccentColor = request.AccentColor;

        if (!string.IsNullOrEmpty(request.Density) &&
            Enum.TryParse<UiDensity>(request.Density, true, out var density))
        {
            settings.Density = density;
        }

        // Update Regional settings
        if (!string.IsNullOrEmpty(request.Language))
            settings.Language = request.Language;

        if (!string.IsNullOrEmpty(request.DateFormat))
            settings.DateFormat = request.DateFormat;

        if (!string.IsNullOrEmpty(request.TimeFormat))
            settings.TimeFormat = request.TimeFormat;

        if (!string.IsNullOrEmpty(request.Timezone))
            settings.Timezone = request.Timezone;

        // Update Accessibility settings
        if (request.HighContrastMode.HasValue)
            settings.HighContrastMode = request.HighContrastMode.Value;

        if (request.ReducedMotion.HasValue)
            settings.ReducedMotion = request.ReducedMotion.Value;

        if (!string.IsNullOrEmpty(request.FontSize) &&
            Enum.TryParse<FontSize>(request.FontSize, true, out var fontSize))
        {
            settings.FontSize = fontSize;
        }

        // Update Notification settings
        if (request.EmailNotifications.HasValue)
            settings.EmailNotifications = request.EmailNotifications.Value;

        if (request.PushNotifications.HasValue)
            settings.PushNotifications = request.PushNotifications.Value;

        if (request.InAppNotifications.HasValue)
            settings.InAppNotifications = request.InAppNotifications.Value;

        if (!string.IsNullOrEmpty(request.DigestFrequency) &&
            Enum.TryParse<DigestFrequency>(request.DigestFrequency, true, out var digestFrequency))
        {
            settings.DigestFrequency = digestFrequency;
        }

        settings.ModifiedAt = _dateTimeService.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Audit log
        var newValues = new
        {
            Theme = settings.Theme.ToString(),
            settings.AccentColor,
            Density = settings.Density.ToString(),
            settings.Language,
            settings.DateFormat,
            settings.TimeFormat,
            settings.Timezone,
            settings.HighContrastMode,
            settings.ReducedMotion,
            FontSize = settings.FontSize.ToString(),
            settings.EmailNotifications,
            settings.PushNotifications,
            settings.InAppNotifications,
            DigestFrequency = settings.DigestFrequency.ToString()
        };

        await _auditService.LogAsync(
            AuditAction.Updated,
            "UserSettings",
            settings.Id.ToString(),
            $"User settings updated for user {userId.Value}",
            oldValues: oldValues,
            newValues: newValues,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
