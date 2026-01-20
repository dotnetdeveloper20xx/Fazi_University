using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Enrollments.DTOs;

namespace UniverSysLite.Application.Enrollments.Queries.GetEnrollmentById;

public class GetEnrollmentByIdQueryHandler : IRequestHandler<GetEnrollmentByIdQuery, Result<EnrollmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetEnrollmentByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<EnrollmentDto>> Handle(
        GetEnrollmentByIdQuery request,
        CancellationToken cancellationToken)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Student)
                .ThenInclude(s => s.User)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Course)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Term)
            .Include(e => e.CourseSection)
                .ThenInclude(cs => cs.Instructor)
            .Where(e => e.Id == request.Id)
            .Select(e => new EnrollmentDto
            {
                Id = e.Id,
                StudentId = e.StudentId,
                StudentId_Display = e.Student.StudentId,
                StudentName = e.Student.User.FirstName + " " + e.Student.User.LastName,
                CourseSectionId = e.CourseSectionId,
                CourseCode = e.CourseSection.Course.Code,
                CourseName = e.CourseSection.Course.Name,
                SectionNumber = e.CourseSection.SectionNumber,
                TermName = e.CourseSection.Term.Name,
                Status = e.Status.ToString(),
                EnrollmentDate = e.EnrollmentDate,
                DropDate = e.DropDate,
                WithdrawalDate = e.WithdrawalDate,
                Grade = e.Grade,
                GradePoints = e.GradePoints,
                NumericGrade = e.NumericGrade,
                IsGradeFinalized = e.IsGradeFinalized,
                AttendancePercentage = e.AttendancePercentage,
                Notes = e.Notes,
                CreditHours = e.CourseSection.Course.CreditHours,
                InstructorName = e.CourseSection.Instructor != null
                    ? e.CourseSection.Instructor.FirstName + " " + e.CourseSection.Instructor.LastName
                    : null,
                Schedule = e.CourseSection.Schedule
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (enrollment == null)
        {
            return Result<EnrollmentDto>.Failure("Enrollment not found.");
        }

        return Result<EnrollmentDto>.Success(enrollment);
    }
}
