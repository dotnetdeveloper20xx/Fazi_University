using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.DeleteDepartment;

[Authorize(Permission = "Courses.Delete")]
public record DeleteDepartmentCommand(Guid Id) : IRequest<Result>;
