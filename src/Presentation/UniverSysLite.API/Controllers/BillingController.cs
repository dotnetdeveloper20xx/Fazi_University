using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Billing.Commands.AddCharge;
using UniverSysLite.Application.Billing.Commands.ProcessPayment;
using UniverSysLite.Application.Billing.DTOs;
using UniverSysLite.Application.Billing.Queries.CalculateTuition;
using UniverSysLite.Application.Billing.Queries.GetStudentAccount;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for billing and financial operations.
/// </summary>
[Authorize]
public class BillingController : BaseApiController
{
    /// <summary>
    /// Gets a student's account information.
    /// </summary>
    [HttpGet("student/{studentId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<StudentAccountDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentAccount(Guid studentId)
    {
        var result = await Mediator.Send(new GetStudentAccountQuery(studentId));

        if (!result.Succeeded)
        {
            return NotFound(ApiResponse<object>.Fail(result.Errors.FirstOrDefault() ?? "Student not found"));
        }

        return Ok(ApiResponse<StudentAccountDto>.Ok(result.Value, "Account information retrieved successfully"));
    }

    /// <summary>
    /// Calculates tuition for a student's enrollments in a term.
    /// </summary>
    [HttpGet("student/{studentId:guid}/tuition/{termId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<TuitionCalculationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CalculateTuition(Guid studentId, Guid termId)
    {
        var query = new CalculateTuitionQuery
        {
            StudentId = studentId,
            TermId = termId
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<TuitionCalculationDto>.Ok(result.Value, "Tuition calculated successfully"));
    }

    /// <summary>
    /// Adds a charge to a student's account.
    /// </summary>
    [HttpPost("charge")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddCharge([FromBody] AddChargeCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse.Ok("Charge added successfully"));
    }

    /// <summary>
    /// Processes a payment for a student's account.
    /// </summary>
    [HttpPost("payment")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return CreatedAtAction(
            nameof(GetStudentAccount),
            new { studentId = command.StudentId },
            ApiResponse<Guid>.Ok(result.Value, "Payment processed successfully"));
    }
}
