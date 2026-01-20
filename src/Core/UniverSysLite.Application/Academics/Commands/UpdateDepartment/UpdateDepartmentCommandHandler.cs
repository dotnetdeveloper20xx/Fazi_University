using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.UpdateDepartment;

public class UpdateDepartmentCommandHandler : IRequestHandler<UpdateDepartmentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public UpdateDepartmentCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
    {
        var department = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

        if (department == null)
        {
            throw new NotFoundException("Department", request.Id);
        }

        // Capture old values for audit
        var oldValues = new
        {
            department.Name,
            department.Description,
            department.HeadOfDepartmentId,
            department.Phone,
            department.Email,
            department.Location,
            department.IsActive
        };

        // Update fields if provided
        if (!string.IsNullOrEmpty(request.Name))
            department.Name = request.Name;

        if (request.Description != null)
            department.Description = request.Description;

        if (request.HeadOfDepartmentId.HasValue)
            department.HeadOfDepartmentId = request.HeadOfDepartmentId;

        if (request.Phone != null)
            department.Phone = request.Phone;

        if (request.Email != null)
            department.Email = request.Email;

        if (request.Location != null)
            department.Location = request.Location;

        if (request.IsActive.HasValue)
            department.IsActive = request.IsActive.Value;

        department.ModifiedAt = _dateTimeService.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Audit log
        var newValues = new
        {
            department.Name,
            department.Description,
            department.HeadOfDepartmentId,
            department.Phone,
            department.Email,
            department.Location,
            department.IsActive
        };

        await _auditService.LogAsync(
            AuditAction.Updated,
            "Department",
            department.Id.ToString(),
            $"Department {department.Code} - {department.Name} updated",
            oldValues: oldValues,
            newValues: newValues,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
