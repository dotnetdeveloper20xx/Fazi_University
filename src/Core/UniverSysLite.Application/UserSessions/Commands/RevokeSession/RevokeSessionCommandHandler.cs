using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.UserSessions.Commands.RevokeSession;

public class RevokeSessionCommandHandler : IRequestHandler<RevokeSessionCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public RevokeSessionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(RevokeSessionCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (!userId.HasValue || userId == Guid.Empty)
        {
            return Result.Failure("User not authenticated.");
        }

        var session = await _context.UserSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.UserId == userId.Value, cancellationToken);

        if (session == null)
        {
            throw new NotFoundException("UserSession", request.SessionId);
        }

        if (!session.IsActive)
        {
            return Result.Failure("Session is already inactive.");
        }

        // Don't allow revoking the current session through this endpoint
        // (use logout instead)
        if (session.Id == _currentUserService.SessionId)
        {
            return Result.Failure("Cannot revoke current session. Use logout instead.");
        }

        session.IsActive = false;
        session.LogoutAt = _dateTimeService.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Audit log
        await _auditService.LogAsync(
            AuditAction.Logout,
            "UserSession",
            session.Id.ToString(),
            $"Session revoked for user {userId.Value} - Device: {session.DeviceInfo}, IP: {session.IpAddress}",
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
