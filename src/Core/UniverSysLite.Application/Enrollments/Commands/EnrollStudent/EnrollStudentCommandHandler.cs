using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Enrollments.Commands.EnrollStudent;

public class EnrollStudentCommandHandler : IRequestHandler<EnrollStudentCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeService _dateTimeService;
    private readonly IAuditService _auditService;

    public EnrollStudentCommandHandler(
        IApplicationDbContext context,
        IDateTimeService dateTimeService,
        IAuditService auditService)
    {
        _context = context;
        _dateTimeService = dateTimeService;
        _auditService = auditService;
    }

    public async Task<Result<Guid>> Handle(EnrollStudentCommand request, CancellationToken cancellationToken)
    {
        // Verify student exists
        var student = await _context.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && !s.IsDeleted, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student", request.StudentId);
        }

        // Verify course section exists and is open
        var section = await _context.CourseSections
            .Include(cs => cs.Course)
            .Include(cs => cs.Term)
            .FirstOrDefaultAsync(cs => cs.Id == request.CourseSectionId && !cs.IsDeleted, cancellationToken);

        if (section == null)
        {
            throw new NotFoundException("Course Section", request.CourseSectionId);
        }

        if (!section.IsOpen)
        {
            return Result<Guid>.Failure("This course section is not open for enrollment.");
        }

        if (section.IsCancelled)
        {
            return Result<Guid>.Failure("This course section has been cancelled.");
        }

        // Check if student is already enrolled in this section
        var existingEnrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e =>
                e.StudentId == request.StudentId &&
                e.CourseSectionId == request.CourseSectionId &&
                (e.Status == EnrollmentStatus.Enrolled || e.Status == EnrollmentStatus.Waitlisted),
                cancellationToken);

        if (existingEnrollment != null)
        {
            return Result<Guid>.Failure("Student is already enrolled or waitlisted in this section.");
        }

        // Check if student has already completed this course
        var hasCompletedCourse = await _context.Enrollments
            .AnyAsync(e =>
                e.StudentId == request.StudentId &&
                e.CourseSection.CourseId == section.CourseId &&
                e.Status == EnrollmentStatus.Completed,
                cancellationToken);

        if (hasCompletedCourse)
        {
            return Result<Guid>.Failure("Student has already completed this course.");
        }

        // Check prerequisites
        var prerequisites = await _context.CoursePrerequisites
            .Where(cp => cp.CourseId == section.CourseId)
            .ToListAsync(cancellationToken);

        foreach (var prereq in prerequisites)
        {
            var hasCompletedPrereq = await _context.Enrollments
                .AnyAsync(e =>
                    e.StudentId == request.StudentId &&
                    e.CourseSection.CourseId == prereq.PrerequisiteCourseId &&
                    e.Status == EnrollmentStatus.Completed &&
                    (prereq.MinimumGrade == null || CompareGrades(e.Grade, prereq.MinimumGrade)),
                    cancellationToken);

            if (!hasCompletedPrereq && !prereq.IsConcurrent)
            {
                var prereqCourse = await _context.Courses
                    .FirstOrDefaultAsync(c => c.Id == prereq.PrerequisiteCourseId, cancellationToken);

                return Result<Guid>.Failure($"Prerequisite not met: {prereqCourse?.Code ?? "Unknown"} required.");
            }
        }

        // Determine enrollment status based on availability
        EnrollmentStatus status;
        if (section.CurrentEnrollment < section.MaxEnrollment)
        {
            status = EnrollmentStatus.Enrolled;
            section.CurrentEnrollment++;
        }
        else if (section.WaitlistCount < section.WaitlistCapacity)
        {
            status = EnrollmentStatus.Waitlisted;
            section.WaitlistCount++;
        }
        else
        {
            return Result<Guid>.Failure("Section is full and waitlist is at capacity.");
        }

        var enrollment = new Enrollment
        {
            StudentId = request.StudentId,
            CourseSectionId = request.CourseSectionId,
            Status = status,
            EnrollmentDate = _dateTimeService.UtcNow,
            Notes = request.Notes,
            CreatedAt = _dateTimeService.UtcNow
        };

        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync(cancellationToken);

        var statusText = status == EnrollmentStatus.Waitlisted ? "waitlisted in" : "enrolled in";
        await _auditService.LogAsync(
            AuditAction.Created,
            "Enrollment",
            enrollment.Id.ToString(),
            $"Student {student.StudentId} {statusText} {section.Course.Code}-{section.SectionNumber}",
            cancellationToken: cancellationToken);

        return Result<Guid>.Success(enrollment.Id);
    }

    private static bool CompareGrades(string? actualGrade, string? minimumGrade)
    {
        if (string.IsNullOrEmpty(actualGrade) || string.IsNullOrEmpty(minimumGrade))
            return false;

        var gradeOrder = new Dictionary<string, int>
        {
            { "A+", 13 }, { "A", 12 }, { "A-", 11 },
            { "B+", 10 }, { "B", 9 }, { "B-", 8 },
            { "C+", 7 }, { "C", 6 }, { "C-", 5 },
            { "D+", 4 }, { "D", 3 }, { "D-", 2 },
            { "F", 1 }, { "P", 6 }, { "NP", 0 }
        };

        if (!gradeOrder.TryGetValue(actualGrade.ToUpper(), out var actualValue) ||
            !gradeOrder.TryGetValue(minimumGrade.ToUpper(), out var minimumValue))
        {
            return false;
        }

        return actualValue >= minimumValue;
    }
}
