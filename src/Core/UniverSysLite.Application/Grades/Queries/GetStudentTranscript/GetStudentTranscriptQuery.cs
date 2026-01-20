using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Grades.DTOs;

namespace UniverSysLite.Application.Grades.Queries.GetStudentTranscript;

[Authorize(Permission = "Grades.View")]
public record GetStudentTranscriptQuery(Guid StudentId) : IRequest<Result<TranscriptDto>>;
