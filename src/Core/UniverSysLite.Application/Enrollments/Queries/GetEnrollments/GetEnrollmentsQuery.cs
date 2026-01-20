using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Enrollments.DTOs;

namespace UniverSysLite.Application.Enrollments.Queries.GetEnrollments;

[Authorize(Permission = "Courses.View")]
public record GetEnrollmentsQuery : IRequest<Result<PaginatedList<EnrollmentListDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public Guid? StudentId { get; init; }
    public Guid? CourseSectionId { get; init; }
    public Guid? CourseId { get; init; }
    public Guid? TermId { get; init; }
    public string? Status { get; init; }
    public bool? IsGradeFinalized { get; init; }
    public string? SortBy { get; init; } = "EnrollmentDate";
    public bool SortDescending { get; init; } = true;
}
