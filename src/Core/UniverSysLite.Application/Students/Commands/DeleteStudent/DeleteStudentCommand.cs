using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Students.Commands.DeleteStudent;

[Authorize(Permission = "Students.Delete")]
public record DeleteStudentCommand(Guid Id) : IRequest<Result>;
