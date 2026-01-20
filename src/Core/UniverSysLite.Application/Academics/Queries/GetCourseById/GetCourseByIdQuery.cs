using MediatR;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Queries.GetCourseById;

[Authorize(Permission = "Courses.View")]
public record GetCourseByIdQuery(Guid Id) : IRequest<Result<CourseDto>>;
