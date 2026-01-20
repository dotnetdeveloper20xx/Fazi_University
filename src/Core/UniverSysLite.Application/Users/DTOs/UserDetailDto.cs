namespace UniverSysLite.Application.Users.DTOs;

/// <summary>
/// Detailed user information including profile and settings.
/// </summary>
public class UserDetailDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? DisplayName { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public bool IsActive { get; set; }
    public bool MustChangePassword { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string? LastLoginIp { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ModifiedAt { get; set; }

    // Roles and permissions
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();

    // Profile
    public UserProfileDto? Profile { get; set; }

    // Settings
    public UserSettingsDto? Settings { get; set; }
}

/// <summary>
/// User profile information.
/// </summary>
public class UserProfileDto
{
    public Guid Id { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string? Location { get; set; }
    public string? PhoneNumber { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string Visibility { get; set; } = "Private";
}

/// <summary>
/// User settings/preferences.
/// </summary>
public class UserSettingsDto
{
    public Guid Id { get; set; }
    public string Theme { get; set; } = "System";
    public string Density { get; set; } = "Comfortable";
    public string FontSize { get; set; } = "Medium";
    public string? AccentColor { get; set; }
    public bool HighContrastMode { get; set; }
    public bool ReducedMotion { get; set; }
    public string Language { get; set; } = "en-US";
    public string Timezone { get; set; } = "UTC";
    public string? DateFormat { get; set; }
    public string? TimeFormat { get; set; }
    public bool EmailNotifications { get; set; }
    public bool PushNotifications { get; set; }
    public bool InAppNotifications { get; set; }
    public string DigestFrequency { get; set; } = "Daily";
}
