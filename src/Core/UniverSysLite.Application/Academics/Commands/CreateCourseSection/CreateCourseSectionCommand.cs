using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.CreateCourseSection;

[Authorize(Permission = "Courses.Create")]
public record CreateCourseSectionCommand : IRequest<Result<Guid>>
{
    public Guid CourseId { get; init; }
    public Guid TermId { get; init; }
    public string SectionNumber { get; init; } = string.Empty;
    public Guid? InstructorId { get; init; }
    public int MaxEnrollment { get; init; } = 30;
    public int WaitlistCapacity { get; init; } = 5;
    public string? Room { get; init; }
    public string? Building { get; init; }
    public string? Schedule { get; init; }
    public TimeOnly? StartTime { get; init; }
    public TimeOnly? EndTime { get; init; }
    public string? DaysOfWeek { get; init; }
}
