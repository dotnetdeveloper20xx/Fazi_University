using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Billing.DTOs;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Billing.Queries.CalculateTuition;

public class CalculateTuitionQueryHandler : IRequestHandler<CalculateTuitionQuery, Result<TuitionCalculationDto>>
{
    private readonly IApplicationDbContext _context;
    private const decimal DefaultTuitionPerCredit = 350m;
    private const decimal TechnologyFee = 150m;
    private const decimal StudentServicesFee = 100m;

    public CalculateTuitionQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TuitionCalculationDto>> Handle(
        CalculateTuitionQuery request,
        CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .Include(s => s.Program)
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && !s.IsDeleted, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student", request.StudentId);
        }

        var term = await _context.Terms
            .FirstOrDefaultAsync(t => t.Id == request.TermId && t.IsActive, cancellationToken);

        if (term == null)
        {
            throw new NotFoundException("Term", request.TermId);
        }

        // Get student's enrollments for this term
        var enrollments = await _context.Enrollments
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
            .Where(e => e.StudentId == request.StudentId &&
                        e.CourseSection.TermId == request.TermId &&
                        (e.Status == EnrollmentStatus.Enrolled || e.Status == EnrollmentStatus.Waitlisted))
            .ToListAsync(cancellationToken);

        if (!enrollments.Any())
        {
            return Result<TuitionCalculationDto>.Failure("No enrollments found for this term.");
        }

        var tuitionPerCredit = student.Program?.TuitionPerCredit ?? DefaultTuitionPerCredit;

        var lineItems = enrollments.Select(e => new TuitionLineItemDto
        {
            CourseCode = e.CourseSection.Course.Code,
            CourseName = e.CourseSection.Course.Name,
            CreditHours = e.CourseSection.Course.CreditHours,
            TuitionRate = tuitionPerCredit,
            Amount = e.CourseSection.Course.CreditHours * tuitionPerCredit
        }).ToList();

        var totalCredits = lineItems.Sum(li => li.CreditHours);
        var tuitionAmount = lineItems.Sum(li => li.Amount);
        var fees = TechnologyFee + StudentServicesFee;

        var calculation = new TuitionCalculationDto
        {
            StudentId = student.Id,
            TermId = term.Id,
            TermName = term.Name,
            TotalCredits = totalCredits,
            TuitionPerCredit = tuitionPerCredit,
            TuitionAmount = tuitionAmount,
            Fees = fees,
            TotalAmount = tuitionAmount + fees,
            LineItems = lineItems
        };

        return Result<TuitionCalculationDto>.Success(calculation);
    }
}
