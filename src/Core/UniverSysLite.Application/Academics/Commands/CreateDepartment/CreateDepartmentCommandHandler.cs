using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.CreateDepartment;

public class CreateDepartmentCommandHandler : IRequestHandler<CreateDepartmentCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public CreateDepartmentCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result<Guid>> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
    {
        // Check for duplicate code
        var codeExists = await _context.Departments
            .AnyAsync(d => d.Code.ToLower() == request.Code.ToLower(), cancellationToken);

        if (codeExists)
        {
            return Result<Guid>.Failure("A department with this code already exists.");
        }

        var department = new Department
        {
            Id = Guid.NewGuid(),
            Code = request.Code.ToUpper(),
            Name = request.Name,
            Description = request.Description,
            HeadOfDepartmentId = request.HeadOfDepartmentId,
            Phone = request.Phone,
            Email = request.Email,
            Location = request.Location,
            IsActive = true,
            CreatedAt = _dateTimeService.UtcNow
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync(cancellationToken);

        // Audit log
        await _auditService.LogAsync(
            AuditAction.Created,
            "Department",
            department.Id.ToString(),
            $"Department {department.Code} - {department.Name} created",
            cancellationToken: cancellationToken);

        return Result<Guid>.Success(department.Id);
    }
}
