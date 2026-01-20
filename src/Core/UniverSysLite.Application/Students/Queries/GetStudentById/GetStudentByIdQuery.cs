using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Students.DTOs;

namespace UniverSysLite.Application.Students.Queries.GetStudentById;

[Authorize(Permission = "Students.View")]
public record GetStudentByIdQuery(Guid Id) : IRequest<Result<StudentDetailDto>>;
