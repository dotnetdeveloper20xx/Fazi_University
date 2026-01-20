using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Notifications.Commands.UpdateNotificationPreference;

public class UpdateNotificationPreferenceCommandHandler : IRequestHandler<UpdateNotificationPreferenceCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateNotificationPreferenceCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<bool>> Handle(UpdateNotificationPreferenceCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
        {
            return Result<bool>.Failure("User not authenticated");
        }

        if (!Enum.TryParse<NotificationType>(request.NotificationType, true, out var notificationType))
        {
            return Result<bool>.Failure($"Invalid notification type: {request.NotificationType}");
        }

        var preference = await _context.UserNotificationPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId.Value && p.NotificationType == notificationType, cancellationToken);

        if (preference == null)
        {
            preference = new UserNotificationPreference
            {
                UserId = userId.Value,
                NotificationType = notificationType,
                EmailEnabled = request.EmailEnabled,
                PushEnabled = request.PushEnabled,
                InAppEnabled = request.InAppEnabled
            };
            _context.UserNotificationPreferences.Add(preference);
        }
        else
        {
            preference.EmailEnabled = request.EmailEnabled;
            preference.PushEnabled = request.PushEnabled;
            preference.InAppEnabled = request.InAppEnabled;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
