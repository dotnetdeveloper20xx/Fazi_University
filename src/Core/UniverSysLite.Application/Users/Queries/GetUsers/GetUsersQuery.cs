using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Users.DTOs;

namespace UniverSysLite.Application.Users.Queries.GetUsers;

/// <summary>
/// Query to get a paginated list of users with filtering and sorting.
/// </summary>
[Authorize(Permission = "Users.View")]
public record GetUsersQuery : IRequest<Result<PaginatedList<UserListDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? Role { get; init; }
    public bool? IsActive { get; init; }
    public string? SortBy { get; init; } = "CreatedAt";
    public bool SortDescending { get; init; } = true;
}
