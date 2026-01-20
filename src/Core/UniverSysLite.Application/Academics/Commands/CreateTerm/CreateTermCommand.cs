using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.CreateTerm;

[Authorize(Permission = "Courses.Create")]
public record CreateTermCommand : IRequest<Result<Guid>>
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public int AcademicYear { get; init; }
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public DateOnly RegistrationStartDate { get; init; }
    public DateOnly RegistrationEndDate { get; init; }
    public DateOnly AddDropDeadline { get; init; }
    public DateOnly WithdrawalDeadline { get; init; }
    public DateOnly GradesDeadline { get; init; }
}
