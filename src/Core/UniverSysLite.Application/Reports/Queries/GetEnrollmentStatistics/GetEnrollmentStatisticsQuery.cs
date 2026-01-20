using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Reports.DTOs;

namespace UniverSysLite.Application.Reports.Queries.GetEnrollmentStatistics;

[Authorize(Permission = "Reports.View")]
public record GetEnrollmentStatisticsQuery : IRequest<Result<EnrollmentStatisticsDto>>
{
    public Guid? TermId { get; init; }
    public Guid? DepartmentId { get; init; }
}
