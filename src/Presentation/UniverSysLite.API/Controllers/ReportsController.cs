using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Reports.DTOs;
using UniverSysLite.Application.Reports.Queries.GetCourseStatistics;
using UniverSysLite.Application.Reports.Queries.GetDashboardSummary;
using UniverSysLite.Application.Reports.Queries.GetEnrollmentStatistics;
using UniverSysLite.Application.Reports.Queries.GetFinancialSummary;
using UniverSysLite.Application.Reports.Queries.GetGradeDistribution;
using UniverSysLite.Application.Reports.Queries.GetStudentStatistics;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for reports and analytics.
/// </summary>
[Authorize]
public class ReportsController : BaseApiController
{
    /// <summary>
    /// Gets the dashboard summary with key metrics.
    /// </summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(ApiResponse<DashboardSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardSummary()
    {
        var result = await Mediator.Send(new GetDashboardSummaryQuery());

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<DashboardSummaryDto>.Ok(result.Value, "Dashboard summary retrieved successfully"));
    }

    /// <summary>
    /// Gets enrollment statistics.
    /// </summary>
    [HttpGet("enrollments")]
    [ProducesResponseType(typeof(ApiResponse<EnrollmentStatisticsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEnrollmentStatistics(
        [FromQuery] Guid? termId = null,
        [FromQuery] Guid? departmentId = null)
    {
        var query = new GetEnrollmentStatisticsQuery
        {
            TermId = termId,
            DepartmentId = departmentId
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<EnrollmentStatisticsDto>.Ok(result.Value, "Enrollment statistics retrieved successfully"));
    }

    /// <summary>
    /// Gets grade distribution statistics.
    /// </summary>
    [HttpGet("grades")]
    [ProducesResponseType(typeof(ApiResponse<GradeDistributionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGradeDistribution(
        [FromQuery] Guid? termId = null,
        [FromQuery] Guid? courseId = null,
        [FromQuery] Guid? departmentId = null)
    {
        var query = new GetGradeDistributionQuery
        {
            TermId = termId,
            CourseId = courseId,
            DepartmentId = departmentId
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<GradeDistributionDto>.Ok(result.Value, "Grade distribution retrieved successfully"));
    }

    /// <summary>
    /// Gets student statistics.
    /// </summary>
    [HttpGet("students")]
    [ProducesResponseType(typeof(ApiResponse<StudentStatisticsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStudentStatistics(
        [FromQuery] Guid? departmentId = null,
        [FromQuery] Guid? programId = null)
    {
        var query = new GetStudentStatisticsQuery
        {
            DepartmentId = departmentId,
            ProgramId = programId
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<StudentStatisticsDto>.Ok(result.Value, "Student statistics retrieved successfully"));
    }

    /// <summary>
    /// Gets course statistics.
    /// </summary>
    [HttpGet("courses")]
    [ProducesResponseType(typeof(ApiResponse<CourseStatisticsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourseStatistics(
        [FromQuery] Guid? termId = null,
        [FromQuery] Guid? departmentId = null)
    {
        var query = new GetCourseStatisticsQuery
        {
            TermId = termId,
            DepartmentId = departmentId
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<CourseStatisticsDto>.Ok(result.Value, "Course statistics retrieved successfully"));
    }

    /// <summary>
    /// Gets financial summary.
    /// </summary>
    [HttpGet("financial")]
    [ProducesResponseType(typeof(ApiResponse<FinancialSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFinancialSummary()
    {
        var result = await Mediator.Send(new GetFinancialSummaryQuery());

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<FinancialSummaryDto>.Ok(result.Value, "Financial summary retrieved successfully"));
    }
}
