using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.CreateCourse;

[Authorize(Permission = "Courses.Create")]
public record CreateCourseCommand : IRequest<Result<Guid>>
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid DepartmentId { get; init; }
    public int CreditHours { get; init; }
    public int LectureHours { get; init; }
    public int LabHours { get; init; }
    public string Level { get; init; } = "Undergraduate";
    public List<CoursePrerequisiteInput>? Prerequisites { get; init; }
}

public record CoursePrerequisiteInput
{
    public Guid PrerequisiteCourseId { get; init; }
    public string? MinimumGrade { get; init; }
    public bool IsConcurrent { get; init; }
}
