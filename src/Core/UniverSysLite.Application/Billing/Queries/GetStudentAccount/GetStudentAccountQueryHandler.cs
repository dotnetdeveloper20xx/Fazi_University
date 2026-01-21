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
            .Include(s => s.Program)
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && !s.IsDeleted, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student", request.StudentId);
        }

        // Get student's enrollments to generate billing detail
        var enrollments = await _context.Enrollments
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Term)
            .Where(e => e.StudentId == request.StudentId)
            .OrderByDescending(e => e.EnrollmentDate)
            .Take(20)
            .ToListAsync(cancellationToken);

        // Generate charges from enrollments (tuition per enrolled course)
        var tuitionRate = student.Program?.TuitionPerCredit ?? 450m;
        var charges = enrollments
            .Where(e => e.CourseSection?.Course != null && e.CourseSection?.Term != null)
            .Select(e => new ChargeDto
            {
                Description = $"Tuition - {e.CourseSection!.Course!.Code}: {e.CourseSection.Course.Name}",
                Amount = e.CourseSection.Course.CreditHours * tuitionRate,
                ChargeDate = e.EnrollmentDate,
                ChargeType = "Tuition",
                TermName = e.CourseSection.Term?.Name ?? "Unknown Term"
            })
            .ToList();

        // Add additional fees (registration, technology, etc.)
        var termGroups = enrollments
            .Where(e => e.CourseSection?.Term != null)
            .GroupBy(e => e.CourseSection!.Term!.Id)
            .ToList();

        foreach (var termGroup in termGroups)
        {
            var term = termGroup.First().CourseSection?.Term;
            if (term != null)
            {
                charges.Add(new ChargeDto
                {
                    Description = "Registration Fee",
                    Amount = 150m,
                    ChargeDate = term.StartDate.ToDateTime(TimeOnly.MinValue),
                    ChargeType = "Fee",
                    TermName = term.Name
                });

                charges.Add(new ChargeDto
                {
                    Description = "Technology Fee",
                    Amount = 200m,
                    ChargeDate = term.StartDate.ToDateTime(TimeOnly.MinValue),
                    ChargeType = "Fee",
                    TermName = term.Name
                });

                charges.Add(new ChargeDto
                {
                    Description = "Student Activity Fee",
                    Amount = 75m,
                    ChargeDate = term.StartDate.ToDateTime(TimeOnly.MinValue),
                    ChargeType = "Fee",
                    TermName = term.Name
                });
            }
        }

        // Sort charges by date descending
        charges = charges.OrderByDescending(c => c.ChargeDate).Take(15).ToList();

        // Generate payment history based on total charges and current balance
        var totalCharges = charges.Sum(c => c.Amount);
        var totalPaid = Math.Max(0, totalCharges - student.AccountBalance);
        var payments = GeneratePaymentHistory(totalPaid, enrollments, student.AdmissionDate);

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
            RecentCharges = charges,
            RecentPayments = payments
        };

        return Result<StudentAccountDto>.Success(account);
    }

    private static List<PaymentDto> GeneratePaymentHistory(decimal totalPaid, IEnumerable<Domain.Entities.Academic.Enrollment> enrollments, DateTime admissionDate)
    {
        var payments = new List<PaymentDto>();
        if (totalPaid <= 0) return payments;

        var random = new Random(admissionDate.DayOfYear);
        var paymentMethods = new[] { "Credit Card", "Bank Transfer", "Financial Aid", "Scholarship", "Check" };
        var remaining = totalPaid;
        var paymentDate = admissionDate.AddDays(random.Next(10, 30));

        while (remaining > 0 && payments.Count < 10)
        {
            var paymentAmount = Math.Min(remaining, random.Next(500, 5000));
            if (remaining - paymentAmount < 100) paymentAmount = remaining;

            payments.Add(new PaymentDto
            {
                PaymentId = Guid.NewGuid(),
                Amount = Math.Round(paymentAmount, 2),
                PaymentDate = paymentDate,
                PaymentMethod = paymentMethods[random.Next(paymentMethods.Length)],
                ReferenceNumber = $"PAY-{paymentDate:yyyyMMdd}-{random.Next(1000, 9999)}",
                Status = "Completed"
            });

            remaining -= paymentAmount;
            paymentDate = paymentDate.AddDays(random.Next(30, 120));
        }

        return payments.OrderByDescending(p => p.PaymentDate).ToList();
    }
}
