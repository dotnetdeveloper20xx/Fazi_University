using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Grades.Commands.FinalizeGrades;
using UniverSysLite.Application.Grades.Commands.SubmitGrade;
using UniverSysLite.Application.Grades.DTOs;
using UniverSysLite.Application.Grades.Queries.GetStudentGpa;
using UniverSysLite.Application.Grades.Queries.GetStudentTranscript;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for grade management operations.
/// </summary>
[Authorize]
public class GradesController : BaseApiController
{
    /// <summary>
    /// Submits a grade for an enrollment.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitGrade([FromBody] SubmitGradeCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Grade submitted successfully"));
    }

    /// <summary>
    /// Finalizes all grades for a course section.
    /// </summary>
    [HttpPost("section/{sectionId:guid}/finalize")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> FinalizeGrades(Guid sectionId)
    {
        var result = await Mediator.Send(new FinalizeGradesCommand(sectionId));

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<int>.Ok(result.Value, $"Grades finalized for {result.Value} student(s)"));
    }

    /// <summary>
    /// Gets a student's transcript.
    /// </summary>
    [HttpGet("student/{studentId:guid}/transcript")]
    [ProducesResponseType(typeof(ApiResponse<TranscriptDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentTranscript(Guid studentId)
    {
        var result = await Mediator.Send(new GetStudentTranscriptQuery(studentId));

        if (!result.Succeeded)
        {
            return NotFound(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "Transcript not found"));
        }

        return Ok(ApiResponse<TranscriptDto>.Ok(result.Value, "Transcript retrieved successfully"));
    }

    /// <summary>
    /// Gets a student's GPA summary.
    /// </summary>
    [HttpGet("student/{studentId:guid}/gpa")]
    [ProducesResponseType(typeof(ApiResponse<GpaSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentGpa(Guid studentId)
    {
        var result = await Mediator.Send(new GetStudentGpaQuery(studentId));

        if (!result.Succeeded)
        {
            return NotFound(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "Student not found"));
        }

        return Ok(ApiResponse<GpaSummaryDto>.Ok(result.Value, "GPA retrieved successfully"));
    }
}
