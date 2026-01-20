using System.Reflection;
using MediatR;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Domain.Exceptions;

namespace UniverSysLite.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior that enforces authorization requirements.
/// Checks for [Authorize] and [RequirePermission] attributes on requests.
/// </summary>
/// <typeparam name="TRequest">The request type.</typeparam>
/// <typeparam name="TResponse">The response type.</typeparam>
public class AuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuditService _auditService;

    public AuthorizationBehavior(
        ICurrentUserService currentUserService,
        IAuditService auditService)
    {
        _currentUserService = currentUserService;
        _auditService = auditService;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var authorizeAttributes = request.GetType().GetCustomAttributes<AuthorizeAttribute>();

        if (!authorizeAttributes.Any())
        {
            // No authorization required
            return await next();
        }

        // Must be authenticated
        if (!_currentUserService.IsAuthenticated)
        {
            throw new UnauthorizedException("You must be authenticated to perform this action.");
        }

        // Check role-based authorization
        var authorizeAttributesWithRoles = authorizeAttributes
            .Where(a => !string.IsNullOrWhiteSpace(a.Roles));

        if (authorizeAttributesWithRoles.Any())
        {
            var authorized = false;

            foreach (var roles in authorizeAttributesWithRoles.Select(a => a.Roles!.Split(',')))
            {
                foreach (var role in roles)
                {
                    if (_currentUserService.IsInRole(role.Trim()))
                    {
                        authorized = true;
                        break;
                    }
                }
            }

            if (!authorized)
            {
                await _auditService.LogPermissionDeniedAsync(
                    typeof(TRequest).Name,
                    "Role requirement not met",
                    cancellationToken);

                throw new ForbiddenException("You do not have the required role to perform this action.");
            }
        }

        // Check permission-based authorization
        var authorizeAttributesWithPermissions = authorizeAttributes
            .Where(a => !string.IsNullOrWhiteSpace(a.Permission));

        if (authorizeAttributesWithPermissions.Any())
        {
            foreach (var attribute in authorizeAttributesWithPermissions)
            {
                if (!_currentUserService.HasPermission(attribute.Permission!))
                {
                    await _auditService.LogPermissionDeniedAsync(
                        typeof(TRequest).Name,
                        $"Permission '{attribute.Permission}' required",
                        cancellationToken);

                    throw new ForbiddenException($"You do not have the required permission: {attribute.Permission}");
                }
            }
        }

        return await next();
    }
}
