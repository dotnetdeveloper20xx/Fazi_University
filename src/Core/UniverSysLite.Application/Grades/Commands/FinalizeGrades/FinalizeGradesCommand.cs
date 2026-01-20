using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Grades.Commands.FinalizeGrades;

[Authorize(Permission = "Grades.Edit")]
public record FinalizeGradesCommand(Guid CourseSectionId) : IRequest<Result<int>>;
