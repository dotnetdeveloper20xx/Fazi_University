using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Notifications.Commands.SendNotification;

[Authorize(Permission = "Users.Edit")]
public record SendNotificationCommand : IRequest<Result<Guid>>
{
    public Guid UserId { get; init; }
    public string Type { get; init; } = "General";
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? ActionUrl { get; init; }
    public string? ActionText { get; init; }
    public string? Icon { get; init; }
    public string Priority { get; init; } = "Normal";
    public DateTime? ExpiresAt { get; init; }
    public string? EntityType { get; init; }
    public Guid? EntityId { get; init; }
    public bool SendEmail { get; init; } = false;
}
