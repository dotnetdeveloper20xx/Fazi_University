using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Enrollments.DTOs;

namespace UniverSysLite.Application.Enrollments.Queries.GetStudentEnrollments;

[Authorize(Permission = "Students.View")]
public record GetStudentEnrollmentsQuery : IRequest<Result<List<StudentEnrollmentDto>>>
{
    public Guid StudentId { get; init; }
    public Guid? TermId { get; init; }
    public string? Status { get; init; }
    public bool IncludeAll { get; init; } = false;
}
