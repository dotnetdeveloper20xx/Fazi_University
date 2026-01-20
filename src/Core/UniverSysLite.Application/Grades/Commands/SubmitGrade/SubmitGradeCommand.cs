using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Grades.Commands.SubmitGrade;

[Authorize(Permission = "Grades.Edit")]
public record SubmitGradeCommand : IRequest<Result>
{
    public Guid EnrollmentId { get; init; }
    public string Grade { get; init; } = string.Empty;
    public decimal? NumericGrade { get; init; }
    public string? Notes { get; init; }
}
