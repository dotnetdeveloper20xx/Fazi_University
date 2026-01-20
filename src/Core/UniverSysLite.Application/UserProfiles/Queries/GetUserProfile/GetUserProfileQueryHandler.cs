using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Users.DTOs;

namespace UniverSysLite.Application.UserProfiles.Queries.GetUserProfile;

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, Result<UserProfileDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetUserProfileQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<UserProfileDto>> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var userId = request.UserId ?? _currentUserService.UserId;

        if (!userId.HasValue || userId == Guid.Empty)
        {
            return Result<UserProfileDto>.Failure("User not found.");
        }

        var profile = await _context.UserProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId.Value, cancellationToken);

        if (profile == null)
        {
            throw new NotFoundException("UserProfile", userId.Value);
        }

        var dto = new UserProfileDto
        {
            Id = profile.Id,
            AvatarUrl = profile.AvatarUrl,
            Bio = profile.Bio,
            JobTitle = profile.JobTitle,
            Department = profile.Department,
            Location = profile.Location,
            PhoneNumber = profile.PhoneNumber,
            DateOfBirth = profile.DateOfBirth,
            Visibility = profile.Visibility.ToString()
        };

        return Result<UserProfileDto>.Success(dto);
    }
}
