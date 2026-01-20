using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Academics.Commands.CreateCourseSection;
using UniverSysLite.Application.Academics.Commands.DeleteCourseSection;
using UniverSysLite.Application.Academics.Commands.UpdateCourseSection;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Academics.Queries.GetCourseSectionById;
using UniverSysLite.Application.Academics.Queries.GetCourseSections;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for course section management operations.
/// </summary>
[Authorize]
public class CourseSectionsController : BaseApiController
{
    /// <summary>
    /// Gets a paginated list of course sections.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<CourseSectionListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourseSections(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] Guid? courseId = null,
        [FromQuery] Guid? termId = null,
        [FromQuery] Guid? instructorId = null,
        [FromQuery] bool? isOpen = null,
        [FromQuery] bool? hasAvailableSeats = null,
        [FromQuery] string? sortBy = "CourseCode",
        [FromQuery] bool sortDescending = false)
    {
        pageSize = Math.Min(pageSize, 50);

        var query = new GetCourseSectionsQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            CourseId = courseId,
            TermId = termId,
            InstructorId = instructorId,
            IsOpen = isOpen,
            HasAvailableSeats = hasAvailableSeats,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<PaginatedList<CourseSectionListDto>>.OkPaginated(
            result.Value,
            PaginationMetadata.FromPaginatedList(result.Value),
            "Course sections retrieved successfully"));
    }

    /// <summary>
    /// Gets a course section by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CourseSectionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourseSection(Guid id)
    {
        var result = await Mediator.Send(new GetCourseSectionByIdQuery(id));

        if (!result.Succeeded)
        {
            return NotFound(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "Course section not found"));
        }

        return Ok(ApiResponse<CourseSectionDto>.Ok(result.Value, "Course section retrieved successfully"));
    }

    /// <summary>
    /// Creates a new course section.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCourseSection([FromBody] CreateCourseSectionCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return CreatedAtAction(
            nameof(GetCourseSection),
            new { id = result.Value },
            ApiResponse<Guid>.Ok(result.Value, "Course section created successfully"));
    }

    /// <summary>
    /// Updates an existing course section.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCourseSection(Guid id, [FromBody] UpdateCourseSectionCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(ApiResponse<object>.Fail("Course section ID in URL does not match request body"));
        }

        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Course section updated successfully"));
    }

    /// <summary>
    /// Deletes a course section (soft delete).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCourseSection(Guid id)
    {
        var result = await Mediator.Send(new DeleteCourseSectionCommand(id));

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Course section deleted successfully"));
    }
}
