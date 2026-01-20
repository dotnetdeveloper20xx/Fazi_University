using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.DeleteCourse;

[Authorize(Permission = "Courses.Delete")]
public record DeleteCourseCommand(Guid Id) : IRequest<Result>;
