using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.UpdateProgram;

[Authorize(Permission = "Courses.Edit")]
public record UpdateProgramCommand : IRequest<Result>
{
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public int? TotalCreditsRequired { get; init; }
    public int? DurationYears { get; init; }
    public decimal? TuitionPerCredit { get; init; }
    public bool? IsActive { get; init; }
}
