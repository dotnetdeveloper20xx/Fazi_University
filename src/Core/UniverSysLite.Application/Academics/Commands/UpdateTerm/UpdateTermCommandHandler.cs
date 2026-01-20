using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.UpdateTerm;

public class UpdateTermCommandHandler : IRequestHandler<UpdateTermCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public UpdateTermCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(UpdateTermCommand request, CancellationToken cancellationToken)
    {
        var term = await _context.Terms
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (term == null)
        {
            throw new NotFoundException("Term", request.Id);
        }

        var oldValues = new { term.Name, term.IsCurrent, term.IsActive };

        if (!string.IsNullOrEmpty(request.Name))
            term.Name = request.Name;

        if (request.StartDate.HasValue)
            term.StartDate = request.StartDate.Value;

        if (request.EndDate.HasValue)
            term.EndDate = request.EndDate.Value;

        if (request.RegistrationStartDate.HasValue)
            term.RegistrationStartDate = request.RegistrationStartDate.Value;

        if (request.RegistrationEndDate.HasValue)
            term.RegistrationEndDate = request.RegistrationEndDate.Value;

        if (request.AddDropDeadline.HasValue)
            term.AddDropDeadline = request.AddDropDeadline.Value;

        if (request.WithdrawalDeadline.HasValue)
            term.WithdrawalDeadline = request.WithdrawalDeadline.Value;

        if (request.GradesDeadline.HasValue)
            term.GradesDeadline = request.GradesDeadline.Value;

        if (request.IsCurrent.HasValue)
        {
            // If setting as current, unset other current terms
            if (request.IsCurrent.Value)
            {
                var currentTerms = await _context.Terms
                    .Where(t => t.IsCurrent && t.Id != request.Id)
                    .ToListAsync(cancellationToken);

                foreach (var currentTerm in currentTerms)
                {
                    currentTerm.IsCurrent = false;
                }
            }
            term.IsCurrent = request.IsCurrent.Value;
        }

        if (request.IsActive.HasValue)
            term.IsActive = request.IsActive.Value;

        term.ModifiedAt = _dateTimeService.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        var newValues = new { term.Name, term.IsCurrent, term.IsActive };

        await _auditService.LogAsync(
            AuditAction.Updated,
            "Term",
            term.Id.ToString(),
            $"Term {term.Code} - {term.Name} updated",
            oldValues: oldValues,
            newValues: newValues,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
