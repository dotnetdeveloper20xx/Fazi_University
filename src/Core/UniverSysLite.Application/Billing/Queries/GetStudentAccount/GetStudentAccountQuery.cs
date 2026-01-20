using MediatR;
using UniverSysLite.Application.Billing.DTOs;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Billing.Queries.GetStudentAccount;

[Authorize(Permission = "Billing.View")]
public record GetStudentAccountQuery(Guid StudentId) : IRequest<Result<StudentAccountDto>>;
