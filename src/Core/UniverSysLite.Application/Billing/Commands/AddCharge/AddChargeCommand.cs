using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Billing.Commands.AddCharge;

[Authorize(Permission = "Billing.Create")]
public record AddChargeCommand : IRequest<Result>
{
    public Guid StudentId { get; init; }
    public decimal Amount { get; init; }
    public string Description { get; init; } = string.Empty;
    public string ChargeType { get; init; } = string.Empty;
    public Guid? TermId { get; init; }
}
