using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Enrollments.Commands.WithdrawEnrollment;

[Authorize(Permission = "Courses.Edit")]
public record WithdrawEnrollmentCommand(Guid EnrollmentId, string? Reason = null) : IRequest<Result>;
