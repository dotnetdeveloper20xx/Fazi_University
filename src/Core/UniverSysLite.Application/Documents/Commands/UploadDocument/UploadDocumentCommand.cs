using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Documents.DTOs;

namespace UniverSysLite.Application.Documents.Commands.UploadDocument;

[Authorize(Permission = "Students.Edit")]
public record UploadDocumentCommand : IRequest<Result<DocumentUploadResultDto>>
{
    public Guid StudentId { get; init; }
    public string Type { get; init; } = "Other";
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public Stream FileContent { get; init; } = Stream.Null;
    public long FileSize { get; init; }
    public DateTime? ExpirationDate { get; init; }
}
