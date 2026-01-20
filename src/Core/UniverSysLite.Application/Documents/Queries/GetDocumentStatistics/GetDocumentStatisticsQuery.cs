using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Documents.DTOs;

namespace UniverSysLite.Application.Documents.Queries.GetDocumentStatistics;

[Authorize(Permission = "Reports.View")]
public record GetDocumentStatisticsQuery : IRequest<Result<DocumentStatisticsDto>>
{
    public Guid? StudentId { get; init; }
}
