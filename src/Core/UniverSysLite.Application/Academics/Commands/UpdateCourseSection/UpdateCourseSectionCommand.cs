using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.UpdateCourseSection;

[Authorize(Permission = "Courses.Edit")]
public record UpdateCourseSectionCommand : IRequest<Result>
{
    public Guid Id { get; init; }
    public Guid? InstructorId { get; init; }
    public int? MaxEnrollment { get; init; }
    public int? WaitlistCapacity { get; init; }
    public string? Room { get; init; }
    public string? Building { get; init; }
    public string? Schedule { get; init; }
    public TimeOnly? StartTime { get; init; }
    public TimeOnly? EndTime { get; init; }
    public string? DaysOfWeek { get; init; }
    public bool? IsOpen { get; init; }
    public bool? IsCancelled { get; init; }
}
