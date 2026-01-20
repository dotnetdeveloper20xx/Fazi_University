using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Grades.DTOs;

namespace UniverSysLite.Application.Grades.Queries.GetStudentGpa;

[Authorize(Permission = "Grades.View")]
public record GetStudentGpaQuery(Guid StudentId) : IRequest<Result<GpaSummaryDto>>;
