using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.UserProfiles.Commands.UpdateUserProfile;

/// <summary>
/// Command to update a user's profile.
/// If UserId is null, updates the current user's profile.
/// </summary>
[Authorize]
public record UpdateUserProfileCommand : IRequest<Result>
{
    public Guid? UserId { get; init; }
    public string? AvatarUrl { get; init; }
    public string? Bio { get; init; }
    public string? JobTitle { get; init; }
    public string? Department { get; init; }
    public string? Location { get; init; }
    public string? PhoneNumber { get; init; }
    public DateOnly? DateOfBirth { get; init; }
    public string? Visibility { get; init; }
}
