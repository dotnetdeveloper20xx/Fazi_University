using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Scheduling.Commands.BookRoom;

[Authorize(Permission = "Courses.Create")]
public record BookRoomCommand : IRequest<Result<Guid>>
{
    public Guid RoomId { get; init; }
    public Guid? CourseSectionId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string BookingType { get; init; } = "Class";
    public DateOnly Date { get; init; }
    public TimeOnly StartTime { get; init; }
    public TimeOnly EndTime { get; init; }
    public bool IsRecurring { get; init; }
    public string? RecurrencePattern { get; init; }
    public DateOnly? RecurrenceEndDate { get; init; }
}
