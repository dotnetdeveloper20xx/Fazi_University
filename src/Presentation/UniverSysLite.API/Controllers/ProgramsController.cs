using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Academics.Commands.CreateProgram;
using UniverSysLite.Application.Academics.Commands.DeleteProgram;
using UniverSysLite.Application.Academics.Commands.UpdateProgram;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Academics.Queries.GetProgramById;
using UniverSysLite.Application.Academics.Queries.GetPrograms;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for academic program management operations.
/// </summary>
[Authorize]
public class ProgramsController : BaseApiController
{
    /// <summary>
    /// Gets a paginated list of academic programs.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<ProgramListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPrograms(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] Guid? departmentId = null,
        [FromQuery] string? degreeType = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? sortBy = "Name",
        [FromQuery] bool sortDescending = false)
    {
        pageSize = Math.Min(pageSize, 50);

        var query = new GetProgramsQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            DepartmentId = departmentId,
            DegreeType = degreeType,
            IsActive = isActive,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<PaginatedList<ProgramListDto>>.OkPaginated(
            result.Value,
            PaginationMetadata.FromPaginatedList(result.Value),
            "Programs retrieved successfully"));
    }

    /// <summary>
    /// Gets an academic program by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ProgramDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProgram(Guid id)
    {
        var result = await Mediator.Send(new GetProgramByIdQuery(id));

        if (!result.Succeeded)
        {
            return NotFound(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "Program not found"));
        }

        return Ok(ApiResponse<ProgramDto>.Ok(result.Value, "Program retrieved successfully"));
    }

    /// <summary>
    /// Creates a new academic program.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProgram([FromBody] CreateProgramCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return CreatedAtAction(
            nameof(GetProgram),
            new { id = result.Value },
            ApiResponse<Guid>.Ok(result.Value, "Program created successfully"));
    }

    /// <summary>
    /// Updates an existing academic program.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProgram(Guid id, [FromBody] UpdateProgramCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(ApiResponse<object>.Fail("Program ID in URL does not match request body"));
        }

        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Program updated successfully"));
    }

    /// <summary>
    /// Deletes an academic program (soft delete).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProgram(Guid id)
    {
        var result = await Mediator.Send(new DeleteProgramCommand(id));

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Program deleted successfully"));
    }
}
