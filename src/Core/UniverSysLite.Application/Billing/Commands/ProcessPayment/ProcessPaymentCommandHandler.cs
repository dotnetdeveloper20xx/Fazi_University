using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Billing.Commands.ProcessPayment;

public class ProcessPaymentCommandHandler : IRequestHandler<ProcessPaymentCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public ProcessPaymentCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result<Guid>> Handle(ProcessPaymentCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && !s.IsDeleted, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student", request.StudentId);
        }

        var oldBalance = student.AccountBalance;
        student.AccountBalance -= request.Amount;
        student.ModifiedAt = _dateTimeService.UtcNow;

        // Remove financial hold if balance is paid off
        if (student.AccountBalance <= 0 && student.HasFinancialHold)
        {
            student.HasFinancialHold = false;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Generate a payment ID (in a real system, this would be stored in a Payment entity)
        var paymentId = Guid.NewGuid();

        await _auditService.LogAsync(
            AuditAction.Created,
            "Payment",
            paymentId.ToString(),
            $"Payment received: ${request.Amount:F2} via {request.PaymentMethod}. Balance: ${oldBalance:F2} -> ${student.AccountBalance:F2}",
            newValues: new
            {
                StudentId = student.StudentId,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                ReferenceNumber = request.ReferenceNumber,
                PreviousBalance = oldBalance,
                NewBalance = student.AccountBalance
            },
            cancellationToken: cancellationToken);

        return Result<Guid>.Success(paymentId);
    }
}
