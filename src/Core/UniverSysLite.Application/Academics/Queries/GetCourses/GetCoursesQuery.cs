using MediatR;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Queries.GetCourses;

[Authorize(Permission = "Courses.View")]
public record GetCoursesQuery : IRequest<Result<PaginatedList<CourseListDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public Guid? DepartmentId { get; init; }
    public string? Level { get; init; }
    public bool? IsActive { get; init; }
    public string? SortBy { get; init; } = "Code";
    public bool SortDescending { get; init; } = false;
}
