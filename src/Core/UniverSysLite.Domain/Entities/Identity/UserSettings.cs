using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities.Identity;

public class UserSettings : BaseAuditableEntity
{
    public Guid UserId { get; set; }

    // Theme
    public ThemeMode Theme { get; set; } = ThemeMode.System;
    public string? AccentColor { get; set; }
    public UiDensity Density { get; set; } = UiDensity.Comfortable;

    // Regional
    public string Language { get; set; } = "en-US";
    public string DateFormat { get; set; } = "MM/dd/yyyy";
    public string TimeFormat { get; set; } = "h:mm tt";
    public string Timezone { get; set; } = "UTC";

    // Accessibility
    public bool HighContrastMode { get; set; } = false;
    public bool ReducedMotion { get; set; } = false;
    public FontSize FontSize { get; set; } = FontSize.Medium;

    // Notifications
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool InAppNotifications { get; set; } = true;
    public DigestFrequency DigestFrequency { get; set; } = DigestFrequency.Immediate;
    public TimeOnly? QuietHoursStart { get; set; }
    public TimeOnly? QuietHoursEnd { get; set; }

    // Navigation property
    public virtual ApplicationUser User { get; set; } = null!;
}
