using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.UpdateCourse;

[Authorize(Permission = "Courses.Edit")]
public record UpdateCourseCommand : IRequest<Result>
{
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public int? CreditHours { get; init; }
    public int? LectureHours { get; init; }
    public int? LabHours { get; init; }
    public bool? IsActive { get; init; }
}
