using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.UpdateTerm;

[Authorize(Permission = "Courses.Edit")]
public record UpdateTermCommand : IRequest<Result>
{
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public DateOnly? StartDate { get; init; }
    public DateOnly? EndDate { get; init; }
    public DateOnly? RegistrationStartDate { get; init; }
    public DateOnly? RegistrationEndDate { get; init; }
    public DateOnly? AddDropDeadline { get; init; }
    public DateOnly? WithdrawalDeadline { get; init; }
    public DateOnly? GradesDeadline { get; init; }
    public bool? IsCurrent { get; init; }
    public bool? IsActive { get; init; }
}
