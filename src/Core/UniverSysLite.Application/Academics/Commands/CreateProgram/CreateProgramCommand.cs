using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.CreateProgram;

[Authorize(Permission = "Courses.Create")]
public record CreateProgramCommand : IRequest<Result<Guid>>
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string DegreeType { get; init; } = string.Empty;
    public Guid DepartmentId { get; init; }
    public int TotalCreditsRequired { get; init; }
    public int DurationYears { get; init; } = 4;
    public decimal TuitionPerCredit { get; init; }
}
