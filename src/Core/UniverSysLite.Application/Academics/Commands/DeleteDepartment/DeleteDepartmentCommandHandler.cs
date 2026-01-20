using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.DeleteDepartment;

public class DeleteDepartmentCommandHandler : IRequestHandler<DeleteDepartmentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public DeleteDepartmentCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
    {
        var department = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

        if (department == null)
        {
            throw new NotFoundException("Department", request.Id);
        }

        // Check for active programs
        var hasActivePrograms = await _context.Programs
            .AnyAsync(p => p.DepartmentId == request.Id && p.IsActive && !p.IsDeleted, cancellationToken);

        if (hasActivePrograms)
        {
            return Result.Failure("Cannot delete department with active programs. Please deactivate or move programs first.");
        }

        // Check for active courses
        var hasActiveCourses = await _context.Courses
            .AnyAsync(c => c.DepartmentId == request.Id && c.IsActive && !c.IsDeleted, cancellationToken);

        if (hasActiveCourses)
        {
            return Result.Failure("Cannot delete department with active courses. Please deactivate or move courses first.");
        }

        // Soft delete
        department.IsDeleted = true;
        department.DeletedAt = _dateTimeService.UtcNow;
        department.IsActive = false;

        await _context.SaveChangesAsync(cancellationToken);

        // Audit log
        await _auditService.LogAsync(
            AuditAction.SoftDeleted,
            "Department",
            department.Id.ToString(),
            $"Department {department.Code} - {department.Name} deleted (soft delete)",
            severity: AuditSeverity.Warning,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
