using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Documents.DTOs;

namespace UniverSysLite.Application.Documents.Queries.GetDocumentById;

[Authorize(Permission = "Students.View")]
public record GetDocumentByIdQuery : IRequest<Result<StudentDocumentDto>>
{
    public Guid DocumentId { get; init; }
}
