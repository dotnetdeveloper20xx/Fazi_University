using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.UserSessions.DTOs;

namespace UniverSysLite.Application.UserSessions.Queries.GetUserSessions;

public class GetUserSessionsQueryHandler : IRequestHandler<GetUserSessionsQuery, Result<List<UserSessionDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetUserSessionsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<List<UserSessionDto>>> Handle(GetUserSessionsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (!userId.HasValue || userId == Guid.Empty)
        {
            return Result<List<UserSessionDto>>.Failure("User not authenticated.");
        }

        var currentSessionId = _currentUserService.SessionId;

        var query = _context.UserSessions
            .AsNoTracking()
            .Where(s => s.UserId == userId.Value);

        if (!request.IncludeInactive)
        {
            query = query.Where(s => s.IsActive);
        }

        var sessions = await query
            .OrderByDescending(s => s.LastActivityAt)
            .Select(s => new UserSessionDto
            {
                Id = s.Id,
                DeviceInfo = s.DeviceInfo,
                Browser = s.Browser,
                OperatingSystem = s.OperatingSystem,
                IpAddress = s.IpAddress,
                Location = s.Location,
                LoginAt = s.LoginAt,
                LastActivityAt = s.LastActivityAt,
                IsActive = s.IsActive,
                IsCurrentSession = currentSessionId.HasValue && s.Id == currentSessionId.Value
            })
            .ToListAsync(cancellationToken);

        return Result<List<UserSessionDto>>.Success(sessions);
    }
}
