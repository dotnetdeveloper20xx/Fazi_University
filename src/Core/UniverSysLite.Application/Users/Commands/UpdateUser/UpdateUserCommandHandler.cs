using MediatR;
using Microsoft.AspNetCore.Identity;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Users.Commands.UpdateUser;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, Result>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public UpdateUserCommandHandler(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null)
        {
            throw new NotFoundException("User", request.UserId);
        }

        // Capture old values for audit
        var oldValues = new
        {
            user.FirstName,
            user.LastName,
            user.DisplayName,
            user.PhoneNumber,
            user.IsActive,
            user.EmailConfirmed,
            user.MustChangePassword,
            Roles = (await _userManager.GetRolesAsync(user)).ToList()
        };

        // Update fields if provided
        if (request.FirstName != null)
            user.FirstName = request.FirstName;

        if (request.LastName != null)
            user.LastName = request.LastName;

        if (request.DisplayName != null)
            user.DisplayName = request.DisplayName;

        if (request.PhoneNumber != null)
            user.PhoneNumber = request.PhoneNumber;

        if (request.IsActive.HasValue)
            user.IsActive = request.IsActive.Value;

        if (request.EmailConfirmed.HasValue)
            user.EmailConfirmed = request.EmailConfirmed.Value;

        if (request.MustChangePassword.HasValue)
            user.MustChangePassword = request.MustChangePassword.Value;

        user.ModifiedAt = _dateTimeService.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return Result.Failure(result.Errors.Select(e => e.Description));
        }

        // Update roles if provided
        if (request.Roles != null && request.Roles.Count > 0)
        {
            // Validate all roles exist
            foreach (var roleName in request.Roles)
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    return Result.Failure($"Role '{roleName}' does not exist.");
                }
            }

            // Remove current roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            // Add new roles
            await _userManager.AddToRolesAsync(user, request.Roles);
        }

        // Audit log
        var newValues = new
        {
            user.FirstName,
            user.LastName,
            user.DisplayName,
            user.PhoneNumber,
            user.IsActive,
            user.EmailConfirmed,
            user.MustChangePassword,
            Roles = request.Roles ?? oldValues.Roles
        };

        await _auditService.LogAsync(
            AuditAction.Updated,
            "User",
            user.Id.ToString(),
            $"User {user.Email} updated",
            oldValues: oldValues,
            newValues: newValues,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
