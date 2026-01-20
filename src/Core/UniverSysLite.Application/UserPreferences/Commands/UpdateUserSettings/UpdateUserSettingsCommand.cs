using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.UserPreferences.Commands.UpdateUserSettings;

/// <summary>
/// Command to update the current user's settings.
/// </summary>
[Authorize]
public record UpdateUserSettingsCommand : IRequest<Result>
{
    // Theme
    public string? Theme { get; init; }
    public string? AccentColor { get; init; }
    public string? Density { get; init; }

    // Regional
    public string? Language { get; init; }
    public string? DateFormat { get; init; }
    public string? TimeFormat { get; init; }
    public string? Timezone { get; init; }

    // Accessibility
    public bool? HighContrastMode { get; init; }
    public bool? ReducedMotion { get; init; }
    public string? FontSize { get; init; }

    // Notifications
    public bool? EmailNotifications { get; init; }
    public bool? PushNotifications { get; init; }
    public bool? InAppNotifications { get; init; }
    public string? DigestFrequency { get; init; }
}
