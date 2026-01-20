using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Scheduling.Commands.BookRoom;
using UniverSysLite.Application.Scheduling.Commands.CancelBooking;
using UniverSysLite.Application.Scheduling.Commands.CreateBuilding;
using UniverSysLite.Application.Scheduling.Commands.CreateRoom;
using UniverSysLite.Application.Scheduling.DTOs;
using UniverSysLite.Application.Scheduling.Queries.GetBuildings;
using UniverSysLite.Application.Scheduling.Queries.GetRoomAvailability;
using UniverSysLite.Application.Scheduling.Queries.GetRoomBookings;
using UniverSysLite.Application.Scheduling.Queries.GetRooms;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for scheduling and room management.
/// </summary>
[Authorize]
public class SchedulingController : BaseApiController
{
    #region Buildings

    /// <summary>
    /// Get all buildings with pagination.
    /// </summary>
    [HttpGet("buildings")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<BuildingListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBuildings([FromQuery] GetBuildingsQuery query)
    {
        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<PaginatedList<BuildingListDto>>.Ok(result.Value, "Buildings retrieved successfully"));
    }

    /// <summary>
    /// Create a new building.
    /// </summary>
    [HttpPost("buildings")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateBuilding([FromBody] CreateBuildingCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<Guid>.Ok(result.Value, "Building created successfully"));
    }

    #endregion

    #region Rooms

    /// <summary>
    /// Get all rooms with pagination and filtering.
    /// </summary>
    [HttpGet("rooms")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<RoomListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRooms([FromQuery] GetRoomsQuery query)
    {
        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<PaginatedList<RoomListDto>>.Ok(result.Value, "Rooms retrieved successfully"));
    }

    /// <summary>
    /// Create a new room.
    /// </summary>
    [HttpPost("rooms")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<Guid>.Ok(result.Value, "Room created successfully"));
    }

    /// <summary>
    /// Get room availability for a specific date.
    /// </summary>
    [HttpGet("rooms/{roomId}/availability")]
    [ProducesResponseType(typeof(ApiResponse<RoomAvailabilityDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoomAvailability(Guid roomId, [FromQuery] DateOnly date)
    {
        var query = new GetRoomAvailabilityQuery { RoomId = roomId, Date = date };
        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<RoomAvailabilityDto>.Ok(result.Value, "Room availability retrieved successfully"));
    }

    #endregion

    #region Bookings

    /// <summary>
    /// Get all room bookings with pagination and filtering.
    /// </summary>
    [HttpGet("bookings")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<RoomBookingDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBookings([FromQuery] GetRoomBookingsQuery query)
    {
        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<PaginatedList<RoomBookingDto>>.Ok(result.Value, "Bookings retrieved successfully"));
    }

    /// <summary>
    /// Book a room.
    /// </summary>
    [HttpPost("bookings")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    public async Task<IActionResult> BookRoom([FromBody] BookRoomCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<Guid>.Ok(result.Value, "Room booked successfully"));
    }

    /// <summary>
    /// Cancel a room booking.
    /// </summary>
    [HttpDelete("bookings/{bookingId}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CancelBooking(Guid bookingId, [FromQuery] string? reason)
    {
        var command = new CancelBookingCommand { BookingId = bookingId, CancellationReason = reason };
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<string>.Ok("Booking cancelled", "Booking cancelled successfully"));
    }

    #endregion
}
