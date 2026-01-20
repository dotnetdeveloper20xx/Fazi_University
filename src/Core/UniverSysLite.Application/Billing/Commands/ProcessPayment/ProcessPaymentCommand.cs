using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Billing.Commands.ProcessPayment;

[Authorize(Permission = "Billing.ProcessPayments")]
public record ProcessPaymentCommand : IRequest<Result<Guid>>
{
    public Guid StudentId { get; init; }
    public decimal Amount { get; init; }
    public string PaymentMethod { get; init; } = string.Empty;
    public string? ReferenceNumber { get; init; }
    public string? Notes { get; init; }
}
