using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.UpdateCourse;

public class UpdateCourseCommandHandler : IRequestHandler<UpdateCourseCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public UpdateCourseCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result> Handle(UpdateCourseCommand request, CancellationToken cancellationToken)
    {
        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (course == null)
        {
            throw new NotFoundException("Course", request.Id);
        }

        var oldValues = new { course.Name, course.CreditHours, course.IsActive };

        if (!string.IsNullOrEmpty(request.Name))
            course.Name = request.Name;

        if (request.Description != null)
            course.Description = request.Description;

        if (request.CreditHours.HasValue)
            course.CreditHours = request.CreditHours.Value;

        if (request.LectureHours.HasValue)
            course.LectureHours = request.LectureHours.Value;

        if (request.LabHours.HasValue)
            course.LabHours = request.LabHours.Value;

        if (request.IsActive.HasValue)
            course.IsActive = request.IsActive.Value;

        course.ModifiedAt = _dateTimeService.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        var newValues = new { course.Name, course.CreditHours, course.IsActive };

        await _auditService.LogAsync(
            AuditAction.Updated,
            "Course",
            course.Id.ToString(),
            $"Course {course.Code} - {course.Name} updated",
            oldValues: oldValues,
            newValues: newValues,
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
