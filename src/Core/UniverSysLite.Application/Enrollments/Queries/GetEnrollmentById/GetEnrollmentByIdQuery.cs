using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Enrollments.DTOs;

namespace UniverSysLite.Application.Enrollments.Queries.GetEnrollmentById;

[Authorize(Permission = "Courses.View")]
public record GetEnrollmentByIdQuery(Guid Id) : IRequest<Result<EnrollmentDto>>;
