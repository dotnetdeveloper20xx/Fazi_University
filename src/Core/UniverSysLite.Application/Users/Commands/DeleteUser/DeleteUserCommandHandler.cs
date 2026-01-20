using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Users.Commands.DeleteUser;

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Result>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public DeleteUserCommandHandler(
        UserManager<ApplicationUser> userManager,
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _userManager = userManager;
        _context = context;
        _currentUserService = currentUserService;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null)
        {
            throw new NotFoundException("User", request.UserId);
        }

        // Prevent self-deletion
        if (_currentUserService.UserId == request.UserId)
        {
            return Result.Failure("You cannot delete your own account.");
        }

        // Check if user is an administrator (prevent deletion of last admin)
        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains("Administrator"))
        {
            // Count administrators by checking how many users are in the Administrator role
            var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Administrator", cancellationToken);
            if (adminRole != null)
            {
                var usersInRole = await _userManager.GetUsersInRoleAsync("Administrator");
                if (usersInRole.Count <= 1)
                {
                    return Result.Failure("Cannot delete the last administrator account.");
                }
            }
        }

        // Soft delete: deactivate the user instead of hard delete
        user.IsActive = false;
        user.ModifiedAt = _dateTimeService.UtcNow;

        // Invalidate all refresh tokens
        var refreshTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == user.Id && !rt.IsRevoked)
            .ToListAsync(cancellationToken);

        foreach (var token in refreshTokens)
        {
            token.IsRevoked = true;
        }

        // End all active sessions
        var sessions = await _context.UserSessions
            .Where(s => s.UserId == user.Id && s.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var session in sessions)
        {
            session.IsActive = false;
            session.LogoutAt = _dateTimeService.UtcNow;
        }

        await _userManager.UpdateAsync(user);
        await _context.SaveChangesAsync(cancellationToken);

        // Audit log
        await _auditService.LogAsync(
            AuditAction.SoftDeleted,
            "User",
            user.Id.ToString(),
            $"User {user.Email} deactivated (soft delete)",
            severity: AuditSeverity.Warning,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
