using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.CreateTerm;

public class CreateTermCommandHandler : IRequestHandler<CreateTermCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public CreateTermCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result<Guid>> Handle(CreateTermCommand request, CancellationToken cancellationToken)
    {
        // Check for duplicate code
        var codeExists = await _context.Terms
            .AnyAsync(t => t.Code.ToLower() == request.Code.ToLower(), cancellationToken);

        if (codeExists)
        {
            return Result<Guid>.Failure("A term with this code already exists.");
        }

        // Parse term type
        if (!Enum.TryParse<TermType>(request.Type, true, out var termType))
        {
            return Result<Guid>.Failure("Invalid term type. Valid values are: Fall, Spring, Summer, Winter, Intersession.");
        }

        // Validate dates
        if (request.StartDate >= request.EndDate)
        {
            return Result<Guid>.Failure("Start date must be before end date.");
        }

        var term = new Term
        {
            Id = Guid.NewGuid(),
            Code = request.Code.ToUpper(),
            Name = request.Name,
            Type = termType,
            AcademicYear = request.AcademicYear,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            RegistrationStartDate = request.RegistrationStartDate,
            RegistrationEndDate = request.RegistrationEndDate,
            AddDropDeadline = request.AddDropDeadline,
            WithdrawalDeadline = request.WithdrawalDeadline,
            GradesDeadline = request.GradesDeadline,
            IsCurrent = false,
            IsActive = true,
            CreatedAt = _dateTimeService.UtcNow
        };

        _context.Terms.Add(term);
        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            AuditAction.Created,
            "Term",
            term.Id.ToString(),
            $"Term {term.Code} - {term.Name} created",
            cancellationToken: cancellationToken);

        return Result<Guid>.Success(term.Id);
    }
}
