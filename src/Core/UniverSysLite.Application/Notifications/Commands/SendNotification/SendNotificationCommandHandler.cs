using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Notifications.Commands.SendNotification;

public class SendNotificationCommandHandler : IRequestHandler<SendNotificationCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public SendNotificationCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<Result<Guid>> Handle(SendNotificationCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("User", request.UserId);
        }

        if (!Enum.TryParse<NotificationType>(request.Type, true, out var notificationType))
        {
            notificationType = NotificationType.General;
        }

        if (!Enum.TryParse<NotificationPriority>(request.Priority, true, out var priority))
        {
            priority = NotificationPriority.Normal;
        }

        var notification = new Notification
        {
            UserId = request.UserId,
            Type = notificationType,
            Title = request.Title,
            Message = request.Message,
            ActionUrl = request.ActionUrl,
            ActionText = request.ActionText,
            Icon = request.Icon,
            Priority = priority,
            ExpiresAt = request.ExpiresAt,
            EntityType = request.EntityType,
            EntityId = request.EntityId
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);

        // Send email if requested and user has email enabled for this notification type
        if (request.SendEmail && !string.IsNullOrEmpty(user.Email))
        {
            var emailPreference = await _context.UserNotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == request.UserId &&
                                         p.NotificationType == notificationType, cancellationToken);

            if (emailPreference == null || emailPreference.EmailEnabled)
            {
                await _emailService.SendEmailAsync(
                    user.Email,
                    request.Title,
                    $"<p>{request.Message}</p>" +
                    (string.IsNullOrEmpty(request.ActionUrl) ? "" :
                        $"<p><a href='{request.ActionUrl}'>{request.ActionText ?? "View Details"}</a></p>"),
                    cancellationToken);
            }
        }

        return Result<Guid>.Success(notification.Id);
    }
}
