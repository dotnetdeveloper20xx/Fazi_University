using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Documents.Commands.VerifyDocument;

[Authorize(Permission = "Students.Edit")]
public record VerifyDocumentCommand : IRequest<Result<bool>>
{
    public Guid DocumentId { get; init; }
    public bool IsVerified { get; init; }
}
