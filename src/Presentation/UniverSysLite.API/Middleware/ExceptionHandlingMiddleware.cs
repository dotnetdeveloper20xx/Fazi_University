using System.Net;
using System.Text.Json;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.API.Middleware;

/// <summary>
/// Global exception handling middleware that catches all unhandled exceptions
/// and returns appropriate API responses.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = "application/json";

        var (statusCode, apiResponse) = exception switch
        {
            ValidationException validationException => (
                HttpStatusCode.BadRequest,
                ApiResponse<object>.Fail(validationException.Errors.SelectMany(e => e.Value))
            ),
            NotFoundException notFoundException => (
                HttpStatusCode.NotFound,
                ApiResponse<object>.Fail(notFoundException.Message)
            ),
            UnauthorizedException unauthorizedException => (
                HttpStatusCode.Unauthorized,
                ApiResponse<object>.Fail(unauthorizedException.Message)
            ),
            ForbiddenAccessException forbiddenException => (
                HttpStatusCode.Forbidden,
                ApiResponse<object>.Fail(forbiddenException.Message)
            ),
            _ => (
                HttpStatusCode.InternalServerError,
                ApiResponse<object>.Fail("An unexpected error occurred. Please try again later.")
            )
        };

        // Log the exception
        if (exception is ValidationException)
        {
            _logger.LogWarning(exception, "Validation error occurred");
        }
        else if (exception is NotFoundException or UnauthorizedException or ForbiddenAccessException)
        {
            _logger.LogWarning(exception, "Client error occurred: {Message}", exception.Message);
        }
        else
        {
            _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);
        }

        response.StatusCode = (int)statusCode;

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await response.WriteAsync(JsonSerializer.Serialize(apiResponse, options));
    }
}
