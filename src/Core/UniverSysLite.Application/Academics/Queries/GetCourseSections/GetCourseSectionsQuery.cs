using MediatR;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Queries.GetCourseSections;

[Authorize(Permission = "Courses.View")]
public record GetCourseSectionsQuery : IRequest<Result<PaginatedList<CourseSectionListDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public Guid? CourseId { get; init; }
    public Guid? TermId { get; init; }
    public Guid? InstructorId { get; init; }
    public bool? IsOpen { get; init; }
    public bool? HasAvailableSeats { get; init; }
    public string? SortBy { get; init; } = "CourseCode";
    public bool SortDescending { get; init; } = false;
}
