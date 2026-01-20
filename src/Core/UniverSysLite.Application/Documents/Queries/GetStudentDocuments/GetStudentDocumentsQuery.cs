using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Documents.DTOs;

namespace UniverSysLite.Application.Documents.Queries.GetStudentDocuments;

[Authorize(Permission = "Students.View")]
public record GetStudentDocumentsQuery : IRequest<Result<PaginatedList<StudentDocumentListDto>>>
{
    public Guid StudentId { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Type { get; init; }
    public bool? IsVerified { get; init; }
    public bool IncludeExpired { get; init; } = true;
}
