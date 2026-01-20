using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Billing.DTOs;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.Application.Billing.Queries.GetStudentAccount;

public class GetStudentAccountQueryHandler : IRequestHandler<GetStudentAccountQuery, Result<StudentAccountDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentAccountQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StudentAccountDto>> Handle(
        GetStudentAccountQuery request,
        CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && !s.IsDeleted, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student", request.StudentId);
        }

        var accountStatus = student.AccountBalance <= 0
            ? "Paid in Full"
            : student.HasFinancialHold
                ? "Financial Hold"
                : "Balance Due";

        var account = new StudentAccountDto
        {
            StudentId = student.Id,
            StudentId_Display = student.StudentId,
            StudentName = $"{student.FirstName} {student.LastName}",
            AccountBalance = student.AccountBalance,
            HasFinancialHold = student.HasFinancialHold,
            AccountStatus = accountStatus,
            RecentCharges = new List<ChargeDto>(), // Would be populated from a Charges table
            RecentPayments = new List<PaymentDto>() // Would be populated from a Payments table
        };

        return Result<StudentAccountDto>.Success(account);
    }
}
