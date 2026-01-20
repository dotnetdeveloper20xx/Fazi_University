using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Documents.DTOs;

namespace UniverSysLite.Application.Documents.Queries.GetDocumentById;

public class GetDocumentByIdQueryHandler : IRequestHandler<GetDocumentByIdQuery, Result<StudentDocumentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;

    public GetDocumentByIdQueryHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
    }

    public async Task<Result<StudentDocumentDto>> Handle(
        GetDocumentByIdQuery request,
        CancellationToken cancellationToken)
    {
        var document = await _context.StudentDocuments
            .Include(d => d.Student)
            .Where(d => d.Id == request.DocumentId && !d.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);

        if (document == null)
        {
            throw new NotFoundException("Document", request.DocumentId);
        }

        var verifiedByName = document.VerifiedById.HasValue
            ? await _context.Users
                .Where(u => u.Id == document.VerifiedById.Value)
                .Select(u => $"{u.FirstName} {u.LastName}")
                .FirstOrDefaultAsync(cancellationToken)
            : null;

        var dto = new StudentDocumentDto
        {
            Id = document.Id,
            StudentId = document.StudentId,
            StudentName = $"{document.Student.FirstName} {document.Student.LastName}",
            StudentNumber = document.Student.StudentId,
            Type = document.Type.ToString(),
            Name = document.Name,
            Description = document.Description,
            OriginalFileName = document.OriginalFileName,
            ContentType = document.ContentType,
            FileSize = document.FileSize,
            FileSizeFormatted = FormatFileSize(document.FileSize),
            IsVerified = document.IsVerified,
            VerifiedAt = document.VerifiedAt,
            VerifiedByName = verifiedByName,
            ExpirationDate = document.ExpirationDate,
            IsExpired = document.ExpirationDate.HasValue && document.ExpirationDate.Value < DateTime.UtcNow.Date,
            CreatedAt = document.CreatedAt,
            DownloadUrl = _fileStorageService.GetFileUrl(document.FilePath)
        };

        return Result<StudentDocumentDto>.Success(dto);
    }

    private static string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB" };
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len /= 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }
}
