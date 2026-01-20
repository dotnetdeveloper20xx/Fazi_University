using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Identity.DTOs;
using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Application.Identity.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthenticationResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;

    public RefreshTokenCommandHandler(
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        IApplicationDbContext context,
        IDateTimeService dateTimeService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _context = context;
        _dateTimeService = dateTimeService;
    }

    public async Task<Result<AuthenticationResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        // Get user ID from expired token
        var userId = _tokenService.GetUserIdFromExpiredToken(request.AccessToken);
        if (userId == null)
        {
            return Result<AuthenticationResponse>.Failure("Invalid access token.");
        }

        // Find the refresh token
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt =>
                rt.Token == request.RefreshToken &&
                rt.UserId == userId.Value &&
                !rt.IsRevoked &&
                !rt.IsUsed,
                cancellationToken);

        if (storedToken == null)
        {
            return Result<AuthenticationResponse>.Failure("Invalid refresh token.");
        }

        if (storedToken.ExpiresAt < _dateTimeService.UtcNow)
        {
            return Result<AuthenticationResponse>.Failure("Refresh token has expired. Please login again.");
        }

        // Get the user
        var user = await _userManager.FindByIdAsync(userId.Value.ToString());
        if (user == null || !user.IsActive)
        {
            return Result<AuthenticationResponse>.Failure("User not found or inactive.");
        }

        // Mark old refresh token as used
        storedToken.IsUsed = true;

        // Get user roles and permissions
        var roles = await _userManager.GetRolesAsync(user);
        var permissions = await GetUserPermissionsAsync(user.Id, cancellationToken);

        // Generate new tokens
        var newAccessToken = await _tokenService.GenerateAccessTokenAsync(user, roles, permissions);
        var newRefreshTokenValue = _tokenService.GenerateRefreshToken();

        // Store new refresh token
        var newRefreshTokenEntity = new Domain.Entities.Identity.RefreshToken
        {
            Token = newRefreshTokenValue,
            UserId = user.Id,
            ExpiresAt = _dateTimeService.UtcNow.AddDays(7),
            CreatedAt = _dateTimeService.UtcNow,
            JwtId = Guid.NewGuid().ToString()
        };

        storedToken.ReplacedByToken = newRefreshTokenValue;

        _context.RefreshTokens.Add(newRefreshTokenEntity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AuthenticationResponse>.Success(new AuthenticationResponse
        {
            UserId = user.Id,
            UserName = user.UserName!,
            Email = user.Email!,
            AccessToken = newAccessToken,
            RefreshToken = newRefreshTokenValue,
            AccessTokenExpiration = _dateTimeService.UtcNow.AddMinutes(15),
            RefreshTokenExpiration = newRefreshTokenEntity.ExpiresAt,
            Roles = roles,
            Permissions = permissions
        });
    }

    private async Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var userRoleIds = await _context.Users
            .Where(u => u.Id == userId)
            .SelectMany(u => u.UserRoles)
            .Select(ur => ur.RoleId)
            .ToListAsync(cancellationToken);

        return await _context.RolePermissions
            .Where(rp => userRoleIds.Contains(rp.RoleId))
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToListAsync(cancellationToken);
    }
}
