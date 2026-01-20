using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Reports.DTOs;

namespace UniverSysLite.Application.Reports.Queries.GetStudentStatistics;

[Authorize(Permission = "Reports.View")]
public record GetStudentStatisticsQuery : IRequest<Result<StudentStatisticsDto>>
{
    public Guid? DepartmentId { get; init; }
    public Guid? ProgramId { get; init; }
}
