using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Notifications.DTOs;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Notifications.Queries.GetNotificationPreferences;

public class GetNotificationPreferencesQueryHandler : IRequestHandler<GetNotificationPreferencesQuery, Result<List<NotificationPreferenceDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetNotificationPreferencesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<List<NotificationPreferenceDto>>> Handle(
        GetNotificationPreferencesQuery request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
        {
            return Result<List<NotificationPreferenceDto>>.Failure("User not authenticated");
        }

        var existingPreferences = await _context.UserNotificationPreferences
            .Where(p => p.UserId == userId.Value)
            .ToListAsync(cancellationToken);

        // Get all notification types and ensure preferences exist for each
        var allTypes = Enum.GetValues<NotificationType>();
        var result = new List<NotificationPreferenceDto>();

        foreach (var type in allTypes)
        {
            var existing = existingPreferences.FirstOrDefault(p => p.NotificationType == type);

            if (existing != null)
            {
                result.Add(new NotificationPreferenceDto
                {
                    Id = existing.Id,
                    NotificationType = type.ToString(),
                    EmailEnabled = existing.EmailEnabled,
                    PushEnabled = existing.PushEnabled,
                    InAppEnabled = existing.InAppEnabled
                });
            }
            else
            {
                // Return default preferences for types without explicit settings
                result.Add(new NotificationPreferenceDto
                {
                    Id = Guid.Empty,
                    NotificationType = type.ToString(),
                    EmailEnabled = true,
                    PushEnabled = true,
                    InAppEnabled = true
                });
            }
        }

        return Result<List<NotificationPreferenceDto>>.Success(result);
    }
}
