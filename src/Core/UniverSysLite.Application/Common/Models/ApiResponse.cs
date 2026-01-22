using System.Text.Json.Serialization;

namespace UniverSysLite.Application.Common.Models;

/// <summary>
/// Standard API response wrapper for consistent response format.
/// </summary>
/// <typeparam name="T">The type of the data payload.</typeparam>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public IEnumerable<string>? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public PaginationMetadata? Pagination { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null) => new()
    {
        Success = true,
        Data = data,
        Message = message
    };

    public static ApiResponse<T> OkPaginated(T data, PaginationMetadata pagination, string? message = null) => new()
    {
        Success = true,
        Data = data,
        Message = message,
        Pagination = pagination
    };

    public static ApiResponse<T> Fail(string error) => new()
    {
        Success = false,
        Errors = new[] { error }
    };

    public static ApiResponse<T> Fail(IEnumerable<string> errors) => new()
    {
        Success = false,
        Errors = errors
    };
}

/// <summary>
/// Non-generic API response for operations that don't return data.
/// </summary>
public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse Ok(string? message = null) => new()
    {
        Success = true,
        Message = message
    };

    public static new ApiResponse Fail(string error) => new()
    {
        Success = false,
        Errors = new[] { error }
    };

    public static new ApiResponse Fail(IEnumerable<string> errors) => new()
    {
        Success = false,
        Errors = errors
    };
}

/// <summary>
/// Metadata for paginated responses.
/// </summary>
public class PaginationMetadata
{
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public bool HasPrevious { get; set; }
    public bool HasNext { get; set; }

    public static PaginationMetadata FromPaginatedList<T>(PaginatedList<T> list) => new()
    {
        CurrentPage = list.PageNumber,
        PageSize = list.PageSize,
        TotalCount = list.TotalCount,
        TotalPages = list.TotalPages,
        HasPrevious = list.HasPreviousPage,
        HasNext = list.HasNextPage
    };
}
