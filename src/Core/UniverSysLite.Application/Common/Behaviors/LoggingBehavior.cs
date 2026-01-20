using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;
using UniverSysLite.Application.Common.Interfaces;

namespace UniverSysLite.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior that logs request/response information.
/// Useful for debugging and monitoring.
/// </summary>
/// <typeparam name="TRequest">The request type.</typeparam>
/// <typeparam name="TResponse">The response type.</typeparam>
public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;
    private readonly ICurrentUserService _currentUserService;

    public LoggingBehavior(
        ILogger<LoggingBehavior<TRequest, TResponse>> logger,
        ICurrentUserService currentUserService)
    {
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = _currentUserService.UserId;
        var userName = _currentUserService.UserName ?? "Anonymous";

        _logger.LogInformation(
            "UniverSysLite Request: {Name} {@UserId} {@UserName} {@Request}",
            requestName, userId, userName, request);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();

            stopwatch.Stop();

            _logger.LogInformation(
                "UniverSysLite Response: {Name} completed in {ElapsedMilliseconds}ms",
                requestName, stopwatch.ElapsedMilliseconds);

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            _logger.LogError(ex,
                "UniverSysLite Request: {Name} failed after {ElapsedMilliseconds}ms with error: {Message}",
                requestName, stopwatch.ElapsedMilliseconds, ex.Message);

            throw;
        }
    }
}
