using MediatR;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Queries.GetCourseSectionById;

[Authorize(Permission = "Courses.View")]
public record GetCourseSectionByIdQuery(Guid Id) : IRequest<Result<CourseSectionDto>>;
