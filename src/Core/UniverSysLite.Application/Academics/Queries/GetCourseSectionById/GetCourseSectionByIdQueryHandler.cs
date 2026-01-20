using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.Application.Academics.Queries.GetCourseSectionById;

public class GetCourseSectionByIdQueryHandler : IRequestHandler<GetCourseSectionByIdQuery, Result<CourseSectionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCourseSectionByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CourseSectionDto>> Handle(GetCourseSectionByIdQuery request, CancellationToken cancellationToken)
    {
        var section = await _context.CourseSections
            .Include(cs => cs.Course)
            .Include(cs => cs.Term)
            .Include(cs => cs.Instructor)
            .Where(cs => cs.Id == request.Id && !cs.IsDeleted)
            .Select(cs => new CourseSectionDto
            {
                Id = cs.Id,
                CourseId = cs.CourseId,
                CourseCode = cs.Course.Code,
                CourseName = cs.Course.Name,
                TermId = cs.TermId,
                TermName = cs.Term.Name,
                SectionNumber = cs.SectionNumber,
                InstructorId = cs.InstructorId,
                InstructorName = cs.Instructor != null ? cs.Instructor.FirstName + " " + cs.Instructor.LastName : null,
                MaxEnrollment = cs.MaxEnrollment,
                CurrentEnrollment = cs.CurrentEnrollment,
                WaitlistCapacity = cs.WaitlistCapacity,
                WaitlistCount = cs.WaitlistCount,
                Room = cs.Room,
                Building = cs.Building,
                Schedule = cs.Schedule,
                StartTime = cs.StartTime,
                EndTime = cs.EndTime,
                DaysOfWeek = cs.DaysOfWeek,
                IsOpen = cs.IsOpen,
                IsCancelled = cs.IsCancelled,
                AvailableSeats = cs.MaxEnrollment - cs.CurrentEnrollment,
                CreatedAt = cs.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (section == null)
        {
            return Result<CourseSectionDto>.Failure("Course section not found.");
        }

        return Result<CourseSectionDto>.Success(section);
    }
}
