using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Academics.Commands.CreateTerm;
using UniverSysLite.Application.Academics.Commands.UpdateTerm;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Academics.Queries.GetTermById;
using UniverSysLite.Application.Academics.Queries.GetTerms;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for academic term management operations.
/// </summary>
[Authorize]
public class TermsController : BaseApiController
{
    /// <summary>
    /// Gets a paginated list of academic terms.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<TermListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTerms(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? academicYear = null,
        [FromQuery] string? type = null,
        [FromQuery] bool? isCurrent = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? sortBy = "StartDate",
        [FromQuery] bool sortDescending = true)
    {
        pageSize = Math.Min(pageSize, 50);

        var query = new GetTermsQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            AcademicYear = academicYear,
            Type = type,
            IsCurrent = isCurrent,
            IsActive = isActive,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<PaginatedList<TermListDto>>.OkPaginated(
            result.Value,
            PaginationMetadata.FromPaginatedList(result.Value),
            "Terms retrieved successfully"));
    }

    /// <summary>
    /// Gets an academic term by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<TermDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTerm(Guid id)
    {
        var result = await Mediator.Send(new GetTermByIdQuery(id));

        if (!result.Succeeded)
        {
            return NotFound(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "Term not found"));
        }

        return Ok(ApiResponse<TermDto>.Ok(result.Value, "Term retrieved successfully"));
    }

    /// <summary>
    /// Creates a new academic term.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTerm([FromBody] CreateTermCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return CreatedAtAction(
            nameof(GetTerm),
            new { id = result.Value },
            ApiResponse<Guid>.Ok(result.Value, "Term created successfully"));
    }

    /// <summary>
    /// Updates an existing academic term.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTerm(Guid id, [FromBody] UpdateTermCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(ApiResponse<object>.Fail("Term ID in URL does not match request body"));
        }

        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Term updated successfully"));
    }
}
