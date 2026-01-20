using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Academics.Commands.CreateCourse;
using UniverSysLite.Application.Academics.Commands.DeleteCourse;
using UniverSysLite.Application.Academics.Commands.UpdateCourse;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Academics.Queries.GetCourseById;
using UniverSysLite.Application.Academics.Queries.GetCourses;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for course management operations.
/// </summary>
[Authorize]
public class CoursesController : BaseApiController
{
    /// <summary>
    /// Gets a paginated list of courses.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<CourseListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourses(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] Guid? departmentId = null,
        [FromQuery] string? level = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? sortBy = "Code",
        [FromQuery] bool sortDescending = false)
    {
        pageSize = Math.Min(pageSize, 50);

        var query = new GetCoursesQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            DepartmentId = departmentId,
            Level = level,
            IsActive = isActive,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<PaginatedList<CourseListDto>>.OkPaginated(
            result.Value,
            PaginationMetadata.FromPaginatedList(result.Value),
            "Courses retrieved successfully"));
    }

    /// <summary>
    /// Gets a course by ID with prerequisites.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CourseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourse(Guid id)
    {
        var result = await Mediator.Send(new GetCourseByIdQuery(id));

        if (!result.Succeeded)
        {
            return NotFound(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "Course not found"));
        }

        return Ok(ApiResponse<CourseDto>.Ok(result.Value, "Course retrieved successfully"));
    }

    /// <summary>
    /// Creates a new course with optional prerequisites.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return CreatedAtAction(
            nameof(GetCourse),
            new { id = result.Value },
            ApiResponse<Guid>.Ok(result.Value, "Course created successfully"));
    }

    /// <summary>
    /// Updates an existing course.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] UpdateCourseCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(ApiResponse<object>.Fail("Course ID in URL does not match request body"));
        }

        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Course updated successfully"));
    }

    /// <summary>
    /// Deletes a course (soft delete).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        var result = await Mediator.Send(new DeleteCourseCommand(id));

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Course deleted successfully"));
    }
}
