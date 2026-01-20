using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Enrollments.Commands.DropEnrollment;

[Authorize(Permission = "Courses.Edit")]
public record DropEnrollmentCommand(Guid EnrollmentId, string? Reason = null) : IRequest<Result>;
