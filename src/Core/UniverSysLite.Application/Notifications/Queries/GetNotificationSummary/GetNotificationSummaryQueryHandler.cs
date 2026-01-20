using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Notifications.DTOs;

namespace UniverSysLite.Application.Notifications.Queries.GetNotificationSummary;

public class GetNotificationSummaryQueryHandler : IRequestHandler<GetNotificationSummaryQuery, Result<NotificationSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetNotificationSummaryQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<NotificationSummaryDto>> Handle(
        GetNotificationSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
        {
            return Result<NotificationSummaryDto>.Failure("User not authenticated");
        }

        var baseQuery = _context.Notifications
            .Where(n => n.UserId == userId.Value && !n.IsArchived)
            .Where(n => n.ExpiresAt == null || n.ExpiresAt > DateTime.UtcNow);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var unreadCount = await baseQuery.CountAsync(n => !n.IsRead, cancellationToken);

        var recentNotifications = await baseQuery
            .OrderByDescending(n => n.CreatedAt)
            .Take(request.RecentCount)
            .Select(n => new NotificationListDto
            {
                Id = n.Id,
                Type = n.Type.ToString(),
                Title = n.Title,
                Message = n.Message,
                ActionUrl = n.ActionUrl,
                Icon = n.Icon,
                IsRead = n.IsRead,
                Priority = n.Priority.ToString(),
                CreatedAt = n.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var summary = new NotificationSummaryDto
        {
            TotalCount = totalCount,
            UnreadCount = unreadCount,
            RecentNotifications = recentNotifications
        };

        return Result<NotificationSummaryDto>.Success(summary);
    }
}
