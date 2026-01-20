using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.CreateProgram;

public class CreateProgramCommandHandler : IRequestHandler<CreateProgramCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public CreateProgramCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result<Guid>> Handle(CreateProgramCommand request, CancellationToken cancellationToken)
    {
        // Validate department exists
        var departmentExists = await _context.Departments
            .AnyAsync(d => d.Id == request.DepartmentId && !d.IsDeleted, cancellationToken);

        if (!departmentExists)
        {
            return Result<Guid>.Failure("Department not found.");
        }

        // Check for duplicate code
        var codeExists = await _context.Programs
            .AnyAsync(p => p.Code.ToLower() == request.Code.ToLower(), cancellationToken);

        if (codeExists)
        {
            return Result<Guid>.Failure("A program with this code already exists.");
        }

        // Parse degree type
        if (!Enum.TryParse<DegreeType>(request.DegreeType, true, out var degreeType))
        {
            return Result<Guid>.Failure("Invalid degree type.");
        }

        var program = new Program
        {
            Id = Guid.NewGuid(),
            Code = request.Code.ToUpper(),
            Name = request.Name,
            Description = request.Description,
            DegreeType = degreeType,
            DepartmentId = request.DepartmentId,
            TotalCreditsRequired = request.TotalCreditsRequired,
            DurationYears = request.DurationYears,
            TuitionPerCredit = request.TuitionPerCredit,
            IsActive = true,
            CreatedAt = _dateTimeService.UtcNow
        };

        _context.Programs.Add(program);
        await _context.SaveChangesAsync(cancellationToken);

        // Audit log
        await _auditService.LogAsync(
            AuditAction.Created,
            "Program",
            program.Id.ToString(),
            $"Program {program.Code} - {program.Name} created",
            cancellationToken: cancellationToken);

        return Result<Guid>.Success(program.Id);
    }
}
