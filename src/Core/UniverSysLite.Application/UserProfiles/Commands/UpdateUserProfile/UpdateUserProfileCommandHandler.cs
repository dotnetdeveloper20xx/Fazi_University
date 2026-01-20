using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.UserProfiles.Commands.UpdateUserProfile;

public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public UpdateUserProfileCommandHandler(
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

    public async Task<Result> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = request.UserId ?? _currentUserService.UserId;

        if (!userId.HasValue || userId == Guid.Empty)
        {
            return Result.Failure("User not found.");
        }

        // Only allow users to edit their own profile or admins to edit others
        if (request.UserId.HasValue && request.UserId != _currentUserService.UserId)
        {
            // Check if current user has Users.Edit permission - handled by authorization behavior
            // If we got here, the user has permission via the pipeline
        }

        var profile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId.Value, cancellationToken);

        if (profile == null)
        {
            throw new NotFoundException("UserProfile", userId.Value);
        }

        // Capture old values for audit
        var oldValues = new
        {
            profile.AvatarUrl,
            profile.Bio,
            profile.JobTitle,
            profile.Department,
            profile.Location,
            profile.PhoneNumber,
            profile.DateOfBirth,
            Visibility = profile.Visibility.ToString()
        };

        // Update fields if provided
        if (request.AvatarUrl != null)
            profile.AvatarUrl = request.AvatarUrl;

        if (request.Bio != null)
            profile.Bio = request.Bio;

        if (request.JobTitle != null)
            profile.JobTitle = request.JobTitle;

        if (request.Department != null)
            profile.Department = request.Department;

        if (request.Location != null)
            profile.Location = request.Location;

        if (request.PhoneNumber != null)
            profile.PhoneNumber = request.PhoneNumber;

        if (request.DateOfBirth.HasValue)
            profile.DateOfBirth = request.DateOfBirth;

        if (!string.IsNullOrEmpty(request.Visibility) &&
            Enum.TryParse<ProfileVisibility>(request.Visibility, true, out var visibility))
        {
            profile.Visibility = visibility;
        }

        profile.ModifiedAt = _dateTimeService.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Audit log
        var newValues = new
        {
            profile.AvatarUrl,
            profile.Bio,
            profile.JobTitle,
            profile.Department,
            profile.Location,
            profile.PhoneNumber,
            profile.DateOfBirth,
            Visibility = profile.Visibility.ToString()
        };

        await _auditService.LogAsync(
            AuditAction.Updated,
            "UserProfile",
            profile.Id.ToString(),
            $"User profile updated for user {userId.Value}",
            oldValues: oldValues,
            newValues: newValues,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
