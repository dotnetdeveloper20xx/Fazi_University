using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Enrollments.DTOs;

namespace UniverSysLite.Application.Enrollments.Queries.GetSectionEnrollments;

[Authorize(Permission = "Courses.View")]
public record GetSectionEnrollmentsQuery : IRequest<Result<List<SectionEnrollmentDto>>>
{
    public Guid CourseSectionId { get; init; }
    public string? Status { get; init; }
    public bool IncludeAll { get; init; } = false;
}
