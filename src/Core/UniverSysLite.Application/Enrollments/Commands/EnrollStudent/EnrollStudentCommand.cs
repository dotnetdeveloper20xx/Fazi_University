using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Enrollments.Commands.EnrollStudent;

[Authorize(Permission = "Courses.Edit")]
public record EnrollStudentCommand : IRequest<Result<Guid>>
{
    public Guid StudentId { get; init; }
    public Guid CourseSectionId { get; init; }
    public string? Notes { get; init; }
}
