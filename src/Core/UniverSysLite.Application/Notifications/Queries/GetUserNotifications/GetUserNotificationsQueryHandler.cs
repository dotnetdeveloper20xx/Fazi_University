using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Notifications.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Notifications.Queries.GetUserNotifications;

public class GetUserNotificationsQueryHandler : IRequestHandler<GetUserNotificationsQuery, Result<PaginatedList<NotificationListDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetUserNotificationsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PaginatedList<NotificationListDto>>> Handle(
        GetUserNotificationsQuery request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
        {
            return Result<PaginatedList<NotificationListDto>>.Failure("User not authenticated");
        }

        var query = _context.Notifications
            .Where(n => n.UserId == userId.Value)
            .AsQueryable();

        if (!request.IncludeArchived)
        {
            query = query.Where(n => !n.IsArchived);
        }

        if (request.IsRead.HasValue)
        {
            query = query.Where(n => n.IsRead == request.IsRead.Value);
        }

        if (!string.IsNullOrEmpty(request.Type) && Enum.TryParse<NotificationType>(request.Type, true, out var notificationType))
        {
            query = query.Where(n => n.Type == notificationType);
        }

        // Exclude expired notifications
        query = query.Where(n => n.ExpiresAt == null || n.ExpiresAt > DateTime.UtcNow);

        var totalCount = await query.CountAsync(cancellationToken);

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
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

        var result = new PaginatedList<NotificationListDto>(notifications, totalCount, request.PageNumber, request.PageSize);
        return Result<PaginatedList<NotificationListDto>>.Success(result);
    }
}
