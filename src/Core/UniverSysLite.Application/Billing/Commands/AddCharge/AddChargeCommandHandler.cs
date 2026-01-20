using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Billing.Commands.AddCharge;

public class AddChargeCommandHandler : IRequestHandler<AddChargeCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public AddChargeCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(AddChargeCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && !s.IsDeleted, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student", request.StudentId);
        }

        var oldBalance = student.AccountBalance;
        student.AccountBalance += request.Amount;
        student.ModifiedAt = _dateTimeService.UtcNow;

        // Set financial hold if balance exceeds threshold (e.g., $1000)
        if (student.AccountBalance > 1000 && !student.HasFinancialHold)
        {
            student.HasFinancialHold = true;
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            AuditAction.Updated,
            "Student",
            student.Id.ToString(),
            $"Charge added: {request.Description} - ${request.Amount:F2}. Balance: ${oldBalance:F2} -> ${student.AccountBalance:F2}",
            oldValues: new { AccountBalance = oldBalance },
            newValues: new { AccountBalance = student.AccountBalance, ChargeAmount = request.Amount },
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
