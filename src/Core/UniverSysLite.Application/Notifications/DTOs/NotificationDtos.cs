namespace UniverSysLite.Application.Notifications.DTOs;

public record NotificationDto
{
    public Guid Id { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? ActionUrl { get; init; }
    public string? ActionText { get; init; }
    public string? Icon { get; init; }
    public bool IsRead { get; init; }
    public DateTime? ReadAt { get; init; }
    public string Priority { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? ExpiresAt { get; init; }
    public string? EntityType { get; init; }
    public Guid? EntityId { get; init; }
}

public record NotificationListDto
{
    public Guid Id { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? ActionUrl { get; init; }
    public string? Icon { get; init; }
    public bool IsRead { get; init; }
    public string Priority { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}

public record NotificationSummaryDto
{
    public int TotalCount { get; init; }
    public int UnreadCount { get; init; }
    public List<NotificationListDto> RecentNotifications { get; init; } = new();
}

public record NotificationPreferenceDto
{
    public Guid Id { get; init; }
    public string NotificationType { get; init; } = string.Empty;
    public bool EmailEnabled { get; init; }
    public bool PushEnabled { get; init; }
    public bool InAppEnabled { get; init; }
}

public record EmailTemplateDto
{
    public string TemplateName { get; init; } = string.Empty;
    public string Subject { get; init; } = string.Empty;
    public string BodyHtml { get; init; } = string.Empty;
    public Dictionary<string, string> Variables { get; init; } = new();
}
