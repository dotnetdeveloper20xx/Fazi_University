using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Reports.DTOs;

namespace UniverSysLite.Application.Reports.Queries.GetFinancialSummary;

[Authorize(Permission = "Reports.View")]
public record GetFinancialSummaryQuery : IRequest<Result<FinancialSummaryDto>>;
