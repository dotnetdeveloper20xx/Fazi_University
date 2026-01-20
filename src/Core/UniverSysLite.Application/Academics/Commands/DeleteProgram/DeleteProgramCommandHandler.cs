using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.DeleteProgram;

public class DeleteProgramCommandHandler : IRequestHandler<DeleteProgramCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public DeleteProgramCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(DeleteProgramCommand request, CancellationToken cancellationToken)
    {
        var program = await _context.Programs
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (program == null)
        {
            throw new NotFoundException("Program", request.Id);
        }

        // Check for enrolled students
        var hasEnrolledStudents = await _context.Students
            .AnyAsync(s => s.ProgramId == request.Id && !s.IsDeleted &&
                (s.Status == StudentStatus.Active || s.Status == StudentStatus.Admitted), cancellationToken);

        if (hasEnrolledStudents)
        {
            return Result.Failure("Cannot delete program with enrolled students.");
        }

        program.IsDeleted = true;
        program.DeletedAt = _dateTimeService.UtcNow;
        program.IsActive = false;

        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            AuditAction.SoftDeleted,
            "Program",
            program.Id.ToString(),
            $"Program {program.Code} - {program.Name} deleted (soft delete)",
            severity: AuditSeverity.Warning,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
