using MediatR;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Queries.GetDepartmentById;

[Authorize(Permission = "Courses.View")]
public record GetDepartmentByIdQuery(Guid Id) : IRequest<Result<DepartmentDto>>;
