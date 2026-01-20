using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Users.DTOs;

namespace UniverSysLite.Application.UserProfiles.Queries.GetUserProfile;

/// <summary>
/// Query to get a user's profile.
/// If UserId is null, returns the current user's profile.
/// </summary>
[Authorize]
public record GetUserProfileQuery(Guid? UserId = null) : IRequest<Result<UserProfileDto>>;
