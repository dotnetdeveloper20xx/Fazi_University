using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Enrollments.Commands.DropEnrollment;
using UniverSysLite.Application.Enrollments.Commands.EnrollStudent;
using UniverSysLite.Application.Enrollments.Commands.WithdrawEnrollment;
using UniverSysLite.Application.Enrollments.DTOs;
using UniverSysLite.Application.Enrollments.Queries.GetEnrollmentById;
using UniverSysLite.Application.Enrollments.Queries.GetEnrollments;
using UniverSysLite.Application.Enrollments.Queries.GetSectionEnrollments;
using UniverSysLite.Application.Enrollments.Queries.GetStudentEnrollments;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for enrollment management operations.
/// </summary>
[Authorize]
public class EnrollmentsController : BaseApiController
{
    /// <summary>
    /// Gets a paginated list of enrollments.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<EnrollmentListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEnrollments(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] Guid? studentId = null,
        [FromQuery] Guid? courseSectionId = null,
        [FromQuery] Guid? courseId = null,
        [FromQuery] Guid? termId = null,
        [FromQuery] string? status = null,
        [FromQuery] bool? isGradeFinalized = null,
        [FromQuery] string? sortBy = "EnrollmentDate",
        [FromQuery] bool sortDescending = true)
    {
        pageSize = Math.Min(pageSize, 50);

        var query = new GetEnrollmentsQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            StudentId = studentId,
            CourseSectionId = courseSectionId,
            CourseId = courseId,
            TermId = termId,
            Status = status,
            IsGradeFinalized = isGradeFinalized,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<PaginatedList<EnrollmentListDto>>.OkPaginated(
            result.Value,
            PaginationMetadata.FromPaginatedList(result.Value),
            "Enrollments retrieved successfully"));
    }

    /// <summary>
    /// Gets an enrollment by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<EnrollmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEnrollment(Guid id)
    {
        var result = await Mediator.Send(new GetEnrollmentByIdQuery(id));

        if (!result.Succeeded)
        {
            return NotFound(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "Enrollment not found"));
        }

        return Ok(ApiResponse<EnrollmentDto>.Ok(result.Value, "Enrollment retrieved successfully"));
    }

    /// <summary>
    /// Gets all enrollments for a student.
    /// </summary>
    [HttpGet("student/{studentId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<List<StudentEnrollmentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStudentEnrollments(
        Guid studentId,
        [FromQuery] Guid? termId = null,
        [FromQuery] string? status = null,
        [FromQuery] bool includeAll = false)
    {
        var query = new GetStudentEnrollmentsQuery
        {
            StudentId = studentId,
            TermId = termId,
            Status = status,
            IncludeAll = includeAll
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<List<StudentEnrollmentDto>>.Ok(
            result.Value,
            "Student enrollments retrieved successfully"));
    }

    /// <summary>
    /// Gets all enrollments for a course section.
    /// </summary>
    [HttpGet("section/{sectionId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<List<SectionEnrollmentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSectionEnrollments(
        Guid sectionId,
        [FromQuery] string? status = null,
        [FromQuery] bool includeAll = false)
    {
        var query = new GetSectionEnrollmentsQuery
        {
            CourseSectionId = sectionId,
            Status = status,
            IncludeAll = includeAll
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<List<SectionEnrollmentDto>>.Ok(
            result.Value,
            "Section enrollments retrieved successfully"));
    }

    /// <summary>
    /// Enrolls a student in a course section.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> EnrollStudent([FromBody] EnrollStudentCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return CreatedAtAction(
            nameof(GetEnrollment),
            new { id = result.Value },
            ApiResponse<Guid>.Ok(result.Value, "Student enrolled successfully"));
    }

    /// <summary>
    /// Drops an enrollment (before add/drop deadline).
    /// </summary>
    [HttpPost("{id:guid}/drop")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DropEnrollment(Guid id, [FromBody] DropEnrollmentRequest? request = null)
    {
        var result = await Mediator.Send(new DropEnrollmentCommand(id, request?.Reason));

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Enrollment dropped successfully"));
    }

    /// <summary>
    /// Withdraws from an enrollment (after add/drop deadline).
    /// </summary>
    [HttpPost("{id:guid}/withdraw")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> WithdrawEnrollment(Guid id, [FromBody] WithdrawEnrollmentRequest? request = null)
    {
        var result = await Mediator.Send(new WithdrawEnrollmentCommand(id, request?.Reason));

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Withdrawal processed successfully"));
    }
}

/// <summary>
/// Request model for dropping an enrollment.
/// </summary>
public record DropEnrollmentRequest
{
    public string? Reason { get; init; }
}

/// <summary>
/// Request model for withdrawing from an enrollment.
/// </summary>
public record WithdrawEnrollmentRequest
{
    public string? Reason { get; init; }
}
