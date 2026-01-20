using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Users.Commands.CreateUser;
using UniverSysLite.Application.Users.Commands.DeleteUser;
using UniverSysLite.Application.Users.Commands.UpdateUser;
using UniverSysLite.Application.Users.DTOs;
using UniverSysLite.Application.Users.Queries.GetUserById;
using UniverSysLite.Application.Users.Queries.GetUsers;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for user management operations.
/// </summary>
[Authorize]
public class UsersController : BaseApiController
{
    /// <summary>
    /// Gets a paginated list of users with filtering and sorting.
    /// </summary>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 50)</param>
    /// <param name="searchTerm">Search by email, name, or display name</param>
    /// <param name="role">Filter by role name</param>
    /// <param name="isActive">Filter by active status</param>
    /// <param name="sortBy">Sort field (email, firstName, lastName, lastLoginAt, createdAt)</param>
    /// <param name="sortDescending">Sort descending (default: true)</param>
    /// <returns>Paginated list of users</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<UserListDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? role = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? sortBy = "CreatedAt",
        [FromQuery] bool sortDescending = true)
    {
        // Limit page size
        pageSize = Math.Min(pageSize, 50);

        var query = new GetUsersQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            Role = role,
            IsActive = isActive,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<PaginatedList<UserListDto>>.OkPaginated(
            result.Value,
            PaginationMetadata.FromPaginatedList(result.Value),
            "Users retrieved successfully"));
    }

    /// <summary>
    /// Gets detailed information about a specific user.
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User details with profile and settings</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUser(Guid id)
    {
        var result = await Mediator.Send(new GetUserByIdQuery(id));

        if (!result.Succeeded)
        {
            return NotFound(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "User not found"));
        }

        return Ok(ApiResponse<UserDetailDto>.Ok(result.Value, "User retrieved successfully"));
    }

    /// <summary>
    /// Creates a new user.
    /// </summary>
    /// <param name="command">User creation details</param>
    /// <returns>Created user ID</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return CreatedAtAction(
            nameof(GetUser),
            new { id = result.Value },
            ApiResponse<Guid>.Ok(result.Value, "User created successfully"));
    }

    /// <summary>
    /// Updates an existing user.
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="command">User update details</param>
    /// <returns>Success status</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserCommand command)
    {
        if (id != command.UserId)
        {
            return BadRequest(ApiResponse<object>.Fail("User ID in URL does not match request body"));
        }

        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("User updated successfully"));
    }

    /// <summary>
    /// Deletes (deactivates) a user.
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var result = await Mediator.Send(new DeleteUserCommand(id));

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("User deleted successfully"));
    }
}
