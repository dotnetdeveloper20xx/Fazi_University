using MediatR;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Queries.GetTermById;

[Authorize(Permission = "Courses.View")]
public record GetTermByIdQuery(Guid Id) : IRequest<Result<TermDto>>;
