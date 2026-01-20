using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Students.Commands.CreateStudent;
using UniverSysLite.Application.Students.Commands.DeleteStudent;
using UniverSysLite.Application.Students.Commands.UpdateStudent;
using UniverSysLite.Application.Students.DTOs;
using UniverSysLite.Application.Students.Queries.GetStudentById;
using UniverSysLite.Application.Students.Queries.GetStudents;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for student management operations.
/// </summary>
[Authorize]
public class StudentsController : BaseApiController
{
    /// <summary>
    /// Gets a paginated list of students with filtering and sorting.
    /// </summary>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 50)</param>
    /// <param name="searchTerm">Search by student ID, name, or email</param>
    /// <param name="status">Filter by student status (Active, OnLeave, Suspended, etc.)</param>
    /// <param name="type">Filter by student type (FullTime, PartTime, Online, etc.)</param>
    /// <param name="programId">Filter by program ID</param>
    /// <param name="departmentId">Filter by department ID</param>
    /// <param name="academicStanding">Filter by academic standing (Good, Warning, Probation, etc.)</param>
    /// <param name="hasHold">Filter by whether student has any hold</param>
    /// <param name="sortBy">Sort field (StudentId, FirstName, LastName, Email, Status, CumulativeGpa, CreatedAt)</param>
    /// <param name="sortDescending">Sort descending (default: true)</param>
    /// <returns>Paginated list of students</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<StudentListDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetStudents(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? status = null,
        [FromQuery] string? type = null,
        [FromQuery] Guid? programId = null,
        [FromQuery] Guid? departmentId = null,
        [FromQuery] string? academicStanding = null,
        [FromQuery] bool? hasHold = null,
        [FromQuery] string? sortBy = "CreatedAt",
        [FromQuery] bool sortDescending = true)
    {
        // Limit page size
        pageSize = Math.Min(pageSize, 50);

        var query = new GetStudentsQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            Status = status,
            Type = type,
            ProgramId = programId,
            DepartmentId = departmentId,
            AcademicStanding = academicStanding,
            HasHold = hasHold,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<PaginatedList<StudentListDto>>.OkPaginated(
            result.Value,
            PaginationMetadata.FromPaginatedList(result.Value),
            "Students retrieved successfully"));
    }

    /// <summary>
    /// Gets detailed information about a specific student.
    /// </summary>
    /// <param name="id">Student ID (GUID)</param>
    /// <returns>Student details including academic and personal information</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<StudentDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudent(Guid id)
    {
        var result = await Mediator.Send(new GetStudentByIdQuery(id));

        if (!result.Succeeded)
        {
            return NotFound(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "Student not found"));
        }

        return Ok(ApiResponse<StudentDetailDto>.Ok(result.Value, "Student retrieved successfully"));
    }

    /// <summary>
    /// Creates a new student record.
    /// </summary>
    /// <param name="command">Student creation details</param>
    /// <returns>Created student ID</returns>
    /// <remarks>
    /// Optionally creates a user account for the student if CreateUserAccount is set to true.
    /// The student will be assigned a system-generated Student ID in format STU-YYYY-XXXXX.
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateStudent([FromBody] CreateStudentCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return CreatedAtAction(
            nameof(GetStudent),
            new { id = result.Value },
            ApiResponse<Guid>.Ok(result.Value, "Student created successfully"));
    }

    /// <summary>
    /// Updates an existing student record.
    /// </summary>
    /// <param name="id">Student ID (GUID)</param>
    /// <param name="command">Student update details</param>
    /// <returns>Success status</returns>
    /// <remarks>
    /// Only provided fields will be updated. Null or empty fields are ignored.
    /// </remarks>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStudent(Guid id, [FromBody] UpdateStudentCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(ApiResponse<object>.Fail("Student ID in URL does not match request body"));
        }

        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Student updated successfully"));
    }

    /// <summary>
    /// Soft deletes a student record.
    /// </summary>
    /// <param name="id">Student ID (GUID)</param>
    /// <returns>Success status</returns>
    /// <remarks>
    /// Cannot delete students with active enrollments. Drop all courses first.
    /// Student status will be set to Withdrawn.
    /// </remarks>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteStudent(Guid id)
    {
        var result = await Mediator.Send(new DeleteStudentCommand(id));

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Student deleted successfully"));
    }
}
