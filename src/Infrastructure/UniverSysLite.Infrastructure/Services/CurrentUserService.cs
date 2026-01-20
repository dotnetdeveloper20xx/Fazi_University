using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using UniverSysLite.Application.Common.Interfaces;

namespace UniverSysLite.Infrastructure.Services;

/// <summary>
/// Service to access information about the currently authenticated user from HttpContext.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }

    public string? Email => User?.FindFirst(ClaimTypes.Email)?.Value;

    public string? UserName => User?.FindFirst(ClaimTypes.Name)?.Value;

    public IEnumerable<string> Roles =>
        User?.FindAll(ClaimTypes.Role).Select(c => c.Value) ?? Enumerable.Empty<string>();

    public IEnumerable<string> Permissions =>
        User?.FindAll("permission").Select(c => c.Value) ?? Enumerable.Empty<string>();

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public bool IsInRole(string role) => User?.IsInRole(role) ?? false;

    public bool HasPermission(string permission) =>
        Permissions.Contains(permission, StringComparer.OrdinalIgnoreCase);

    public string? IpAddress
    {
        get
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null) return null;

            // Check for X-Forwarded-For header (for reverse proxies)
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',').First().Trim();
            }

            return context.Connection.RemoteIpAddress?.ToString();
        }
    }

    public string? UserAgent =>
        _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].FirstOrDefault();

    public Guid? SessionId
    {
        get
        {
            var sessionIdClaim = User?.FindFirst("session_id")?.Value;
            return Guid.TryParse(sessionIdClaim, out var sessionId) ? sessionId : null;
        }
    }
}
