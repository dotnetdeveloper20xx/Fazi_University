using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Documents.Commands.DeleteDocument;

[Authorize(Permission = "Students.Edit")]
public record DeleteDocumentCommand : IRequest<Result<bool>>
{
    public Guid DocumentId { get; init; }
}
