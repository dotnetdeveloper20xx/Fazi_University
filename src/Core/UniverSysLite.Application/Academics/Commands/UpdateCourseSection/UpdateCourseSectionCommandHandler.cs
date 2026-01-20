using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.UpdateCourseSection;

public class UpdateCourseSectionCommandHandler : IRequestHandler<UpdateCourseSectionCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public UpdateCourseSectionCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(UpdateCourseSectionCommand request, CancellationToken cancellationToken)
    {
        var section = await _context.CourseSections
            .Include(cs => cs.Course)
            .FirstOrDefaultAsync(cs => cs.Id == request.Id && !cs.IsDeleted, cancellationToken);

        if (section == null)
        {
            throw new NotFoundException("Course Section", request.Id);
        }

        var oldValues = new { section.InstructorId, section.MaxEnrollment, section.IsOpen, section.IsCancelled };

        if (request.InstructorId.HasValue)
            section.InstructorId = request.InstructorId;

        if (request.MaxEnrollment.HasValue)
        {
            if (request.MaxEnrollment.Value < section.CurrentEnrollment)
            {
                return Result.Failure("Cannot reduce max enrollment below current enrollment.");
            }
            section.MaxEnrollment = request.MaxEnrollment.Value;
        }

        if (request.WaitlistCapacity.HasValue)
            section.WaitlistCapacity = request.WaitlistCapacity.Value;

        if (request.Room != null)
            section.Room = request.Room;

        if (request.Building != null)
            section.Building = request.Building;

        if (request.Schedule != null)
            section.Schedule = request.Schedule;

        if (request.StartTime.HasValue)
            section.StartTime = request.StartTime;

        if (request.EndTime.HasValue)
            section.EndTime = request.EndTime;

        if (request.DaysOfWeek != null)
            section.DaysOfWeek = request.DaysOfWeek;

        if (request.IsOpen.HasValue)
            section.IsOpen = request.IsOpen.Value;

        if (request.IsCancelled.HasValue)
            section.IsCancelled = request.IsCancelled.Value;

        section.ModifiedAt = _dateTimeService.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        var newValues = new { section.InstructorId, section.MaxEnrollment, section.IsOpen, section.IsCancelled };

        await _auditService.LogAsync(
            AuditAction.Updated,
            "CourseSection",
            section.Id.ToString(),
            $"Course section {section.Course.Code}-{section.SectionNumber} updated",
            oldValues: oldValues,
            newValues: newValues,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
