using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Identity.DTOs;
using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Application.Identity.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthenticationResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;
    private readonly IDateTimeService _dateTimeService;
    private readonly ICurrentUserService _currentUserService;

    public LoginCommandHandler(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        IApplicationDbContext context,
        IAuditService auditService,
        IDateTimeService dateTimeService,
        ICurrentUserService currentUserService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _context = context;
        _auditService = auditService;
        _dateTimeService = dateTimeService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<AuthenticationResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
        {
            await _auditService.LogFailedLoginAsync(request.Email, "User not found", cancellationToken);
            return Result<AuthenticationResponse>.Failure("Invalid credentials.");
        }

        if (!user.IsActive)
        {
            await _auditService.LogFailedLoginAsync(request.Email, "Account inactive", cancellationToken);
            return Result<AuthenticationResponse>.Failure("Your account has been deactivated. Please contact support.");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

        if (result.IsLockedOut)
        {
            await _auditService.LogFailedLoginAsync(request.Email, "Account locked", cancellationToken);
            return Result<AuthenticationResponse>.Failure("Account locked. Please try again later.");
        }

        if (!result.Succeeded)
        {
            await _auditService.LogFailedLoginAsync(request.Email, "Invalid password", cancellationToken);
            return Result<AuthenticationResponse>.Failure("Invalid credentials.");
        }

        // Get user roles and permissions
        var roles = await _userManager.GetRolesAsync(user);
        var permissions = await GetUserPermissionsAsync(user.Id, cancellationToken);

        // Generate tokens
        var accessToken = await _tokenService.GenerateAccessTokenAsync(user, roles, permissions);
        var refreshTokenValue = _tokenService.GenerateRefreshToken();

        // Store refresh token
        var refreshTokenEntity = new Domain.Entities.Identity.RefreshToken
        {
            Token = refreshTokenValue,
            UserId = user.Id,
            ExpiresAt = _dateTimeService.UtcNow.AddDays(request.RememberMe ? 30 : 7),
            CreatedAt = _dateTimeService.UtcNow,
            JwtId = Guid.NewGuid().ToString()
        };

        _context.RefreshTokens.Add(refreshTokenEntity);

        // Create user session
        var session = new UserSession
        {
            UserId = user.Id,
            LoginAt = _dateTimeService.UtcNow,
            LastActivityAt = _dateTimeService.UtcNow,
            IpAddress = _currentUserService.IpAddress ?? "Unknown",
            DeviceInfo = _currentUserService.UserAgent ?? "Unknown",
            Browser = "Unknown",
            OperatingSystem = "Unknown",
            IsActive = true
        };

        _context.UserSessions.Add(session);

        // Update last login
        user.LastLoginAt = _dateTimeService.UtcNow;
        await _userManager.UpdateAsync(user);

        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogLoginAsync(user.Id, user.Email!, cancellationToken);

        return Result<AuthenticationResponse>.Success(new AuthenticationResponse
        {
            UserId = user.Id,
            UserName = user.UserName!,
            Email = user.Email!,
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            AccessTokenExpiration = _dateTimeService.UtcNow.AddMinutes(15),
            RefreshTokenExpiration = refreshTokenEntity.ExpiresAt,
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
