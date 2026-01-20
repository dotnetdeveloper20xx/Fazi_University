using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Students.Commands.DeleteStudent;

public class DeleteStudentCommandHandler : IRequestHandler<DeleteStudentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public DeleteStudentCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(DeleteStudentCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student", request.Id);
        }

        // Check for active enrollments
        var hasActiveEnrollments = await _context.Enrollments
            .AnyAsync(e => e.StudentId == request.Id &&
                          (e.Status == EnrollmentStatus.Enrolled || e.Status == EnrollmentStatus.Waitlisted),
                      cancellationToken);

        if (hasActiveEnrollments)
        {
            return Result.Failure("Cannot delete student with active enrollments. Please drop all courses first.");
        }

        // Soft delete
        student.IsDeleted = true;
        student.DeletedAt = _dateTimeService.UtcNow;
        student.Status = StudentStatus.Withdrawn;

        await _context.SaveChangesAsync(cancellationToken);

        // Audit log
        await _auditService.LogAsync(
            AuditAction.SoftDeleted,
            "Student",
            student.Id.ToString(),
            $"Student {student.StudentId} - {student.FullName} deleted (soft delete)",
            severity: AuditSeverity.Warning,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
