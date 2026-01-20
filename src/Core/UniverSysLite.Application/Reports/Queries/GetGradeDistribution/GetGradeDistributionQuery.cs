using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Reports.DTOs;

namespace UniverSysLite.Application.Reports.Queries.GetGradeDistribution;

[Authorize(Permission = "Reports.View")]
public record GetGradeDistributionQuery : IRequest<Result<GradeDistributionDto>>
{
    public Guid? TermId { get; init; }
    public Guid? CourseId { get; init; }
    public Guid? DepartmentId { get; init; }
}
