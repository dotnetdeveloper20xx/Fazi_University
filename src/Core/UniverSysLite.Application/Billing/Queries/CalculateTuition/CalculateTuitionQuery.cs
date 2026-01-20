using MediatR;
using UniverSysLite.Application.Billing.DTOs;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Billing.Queries.CalculateTuition;

[Authorize(Permission = "Billing.View")]
public record CalculateTuitionQuery : IRequest<Result<TuitionCalculationDto>>
{
    public Guid StudentId { get; init; }
    public Guid TermId { get; init; }
}
