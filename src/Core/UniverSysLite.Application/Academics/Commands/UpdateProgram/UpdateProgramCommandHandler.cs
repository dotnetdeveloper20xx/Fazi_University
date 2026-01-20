using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.UpdateProgram;

public class UpdateProgramCommandHandler : IRequestHandler<UpdateProgramCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public UpdateProgramCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(UpdateProgramCommand request, CancellationToken cancellationToken)
    {
        var program = await _context.Programs
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (program == null)
        {
            throw new NotFoundException("Program", request.Id);
        }

        var oldValues = new { program.Name, program.TotalCreditsRequired, program.TuitionPerCredit, program.IsActive };

        if (!string.IsNullOrEmpty(request.Name))
            program.Name = request.Name;

        if (request.Description != null)
            program.Description = request.Description;

        if (request.TotalCreditsRequired.HasValue)
            program.TotalCreditsRequired = request.TotalCreditsRequired.Value;

        if (request.DurationYears.HasValue)
            program.DurationYears = request.DurationYears.Value;

        if (request.TuitionPerCredit.HasValue)
            program.TuitionPerCredit = request.TuitionPerCredit.Value;

        if (request.IsActive.HasValue)
            program.IsActive = request.IsActive.Value;

        program.ModifiedAt = _dateTimeService.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        var newValues = new { program.Name, program.TotalCreditsRequired, program.TuitionPerCredit, program.IsActive };

        await _auditService.LogAsync(
            AuditAction.Updated,
            "Program",
            program.Id.ToString(),
            $"Program {program.Code} - {program.Name} updated",
            oldValues: oldValues,
            newValues: newValues,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
