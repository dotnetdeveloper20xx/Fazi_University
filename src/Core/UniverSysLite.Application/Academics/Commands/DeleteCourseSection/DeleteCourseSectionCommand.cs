using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.DeleteCourseSection;

[Authorize(Permission = "Courses.Delete")]
public record DeleteCourseSectionCommand(Guid Id) : IRequest<Result>;
