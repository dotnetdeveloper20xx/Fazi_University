using MediatR;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Queries.GetProgramById;

[Authorize(Permission = "Courses.View")]
public record GetProgramByIdQuery(Guid Id) : IRequest<Result<ProgramDto>>;
