using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Reports.DTOs;

namespace UniverSysLite.Application.Reports.Queries.GetFinancialSummary;

public class GetFinancialSummaryQueryHandler : IRequestHandler<GetFinancialSummaryQuery, Result<FinancialSummaryDto>>
{
    private readonly IApplicationDbContext _context;

    private const decimal TechnologyFee = 150m;
    private const decimal StudentServicesFee = 100m;

    public GetFinancialSummaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<FinancialSummaryDto>> Handle(
        GetFinancialSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var students = await _context.Students
            .Where(s => !s.IsDeleted)
            .ToListAsync(cancellationToken);

        // Calculate totals from account balances
        // Positive balance = student owes money (charges)
        // Negative balance = overpayment (credit)
        var studentsWithBalance = students.Where(s => s.AccountBalance > 0).ToList();
        var outstandingBalance = studentsWithBalance.Sum(s => s.AccountBalance);
        var studentsWithFinancialHold = students.Count(s => s.HasFinancialHold);
        var averageBalance = studentsWithBalance.Any()
            ? Math.Round(studentsWithBalance.Average(s => s.AccountBalance), 2)
            : 0;

        // Estimate total charges based on enrollments
        var enrollments = await _context.Enrollments
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Term)
            .Include(e => e.Student)
                .ThenInclude(s => s.Program)
            .ToListAsync(cancellationToken);

        // Calculate by term
        var byTerm = enrollments
            .GroupBy(e => new { e.CourseSection.TermId, e.CourseSection.Term.Name })
            .Select(g =>
            {
                var termEnrollments = g.ToList();
                var tuitionTotal = termEnrollments.Sum(e =>
                {
                    var rate = e.Student?.Program?.TuitionPerCredit ?? 350m;
                    return e.CourseSection.Course.CreditHours * rate;
                });

                var uniqueStudents = termEnrollments.Select(e => e.StudentId).Distinct().Count();
                var feesTotal = uniqueStudents * (TechnologyFee + StudentServicesFee);

                return new FinancialByTermDto
                {
                    TermId = g.Key.TermId,
                    TermName = g.Key.Name,
                    TotalTuition = tuitionTotal,
                    TotalFees = feesTotal,
                    TotalCollected = 0 // Would need payment records to calculate
                };
            })
            .OrderByDescending(t => t.TermId)
            .ToList();

        var totalCharges = byTerm.Sum(t => t.TotalTuition + t.TotalFees);
        var totalPayments = totalCharges - outstandingBalance; // Estimated

        var summary = new FinancialSummaryDto
        {
            TotalCharges = totalCharges,
            TotalPayments = totalPayments > 0 ? totalPayments : 0,
            OutstandingBalance = outstandingBalance,
            StudentsWithBalance = studentsWithBalance.Count,
            StudentsWithFinancialHold = studentsWithFinancialHold,
            AverageBalance = averageBalance,
            ByTerm = byTerm
        };

        return Result<FinancialSummaryDto>.Success(summary);
    }
}
