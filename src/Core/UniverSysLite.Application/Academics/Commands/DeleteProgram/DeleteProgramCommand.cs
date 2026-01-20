using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.DeleteProgram;

[Authorize(Permission = "Courses.Delete")]
public record DeleteProgramCommand(Guid Id) : IRequest<Result>;
