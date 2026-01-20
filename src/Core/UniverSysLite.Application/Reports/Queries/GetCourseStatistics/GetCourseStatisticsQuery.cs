using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Reports.DTOs;

namespace UniverSysLite.Application.Reports.Queries.GetCourseStatistics;

[Authorize(Permission = "Reports.View")]
public record GetCourseStatisticsQuery : IRequest<Result<CourseStatisticsDto>>
{
    public Guid? TermId { get; init; }
    public Guid? DepartmentId { get; init; }
}
