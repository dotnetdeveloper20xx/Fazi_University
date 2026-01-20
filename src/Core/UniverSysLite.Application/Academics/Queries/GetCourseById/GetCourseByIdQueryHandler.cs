using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.Application.Academics.Queries.GetCourseById;

public class GetCourseByIdQueryHandler : IRequestHandler<GetCourseByIdQuery, Result<CourseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCourseByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CourseDto>> Handle(GetCourseByIdQuery request, CancellationToken cancellationToken)
    {
        var course = await _context.Courses
            .Include(c => c.Department)
            .Include(c => c.Prerequisites)
                .ThenInclude(p => p.PrerequisiteCourse)
            .Where(c => c.Id == request.Id)
            .Select(c => new CourseDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                Description = c.Description,
                DepartmentId = c.DepartmentId,
                DepartmentName = c.Department.Name,
                CreditHours = c.CreditHours,
                LectureHours = c.LectureHours,
                LabHours = c.LabHours,
                Level = c.Level.ToString(),
                IsActive = c.IsActive,
                Prerequisites = c.Prerequisites.Select(p => new CoursePrerequisiteDto
                {
                    CourseId = p.PrerequisiteCourseId,
                    CourseCode = p.PrerequisiteCourse.Code,
                    CourseName = p.PrerequisiteCourse.Name,
                    MinimumGrade = p.MinimumGrade,
                    IsConcurrent = p.IsConcurrent
                }).ToList(),
                SectionCount = c.Sections.Count(s => !s.IsDeleted),
                CreatedAt = c.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (course == null)
        {
            return Result<CourseDto>.Failure("Course not found.");
        }

        return Result<CourseDto>.Success(course);
    }
}
