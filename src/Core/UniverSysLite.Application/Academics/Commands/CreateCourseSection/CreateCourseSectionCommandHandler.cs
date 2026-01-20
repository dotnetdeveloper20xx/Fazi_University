using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.CreateCourseSection;

public class CreateCourseSectionCommandHandler : IRequestHandler<CreateCourseSectionCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public CreateCourseSectionCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result<Guid>> Handle(CreateCourseSectionCommand request, CancellationToken cancellationToken)
    {
        // Validate course exists
        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.CourseId && !c.IsDeleted, cancellationToken);

        if (course == null)
        {
            return Result<Guid>.Failure("Course not found.");
        }

        // Validate term exists
        var termExists = await _context.Terms
            .AnyAsync(t => t.Id == request.TermId && t.IsActive, cancellationToken);

        if (!termExists)
        {
            return Result<Guid>.Failure("Term not found or inactive.");
        }

        // Check for duplicate section number
        var sectionExists = await _context.CourseSections
            .AnyAsync(cs => cs.CourseId == request.CourseId &&
                           cs.TermId == request.TermId &&
                           cs.SectionNumber.ToLower() == request.SectionNumber.ToLower() &&
                           !cs.IsDeleted, cancellationToken);

        if (sectionExists)
        {
            return Result<Guid>.Failure("A section with this number already exists for this course and term.");
        }

        var section = new CourseSection
        {
            Id = Guid.NewGuid(),
            CourseId = request.CourseId,
            TermId = request.TermId,
            SectionNumber = request.SectionNumber,
            InstructorId = request.InstructorId,
            MaxEnrollment = request.MaxEnrollment,
            CurrentEnrollment = 0,
            WaitlistCapacity = request.WaitlistCapacity,
            WaitlistCount = 0,
            Room = request.Room,
            Building = request.Building,
            Schedule = request.Schedule,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            DaysOfWeek = request.DaysOfWeek,
            IsOpen = true,
            IsCancelled = false,
            CreatedAt = _dateTimeService.UtcNow
        };

        _context.CourseSections.Add(section);
        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            AuditAction.Created,
            "CourseSection",
            section.Id.ToString(),
            $"Course section {course.Code}-{section.SectionNumber} created",
            cancellationToken: cancellationToken);

        return Result<Guid>.Success(section.Id);
    }
}
