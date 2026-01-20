using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Documents.DTOs;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Documents.Commands.UploadDocument;

public class UploadDocumentCommandHandler : IRequestHandler<UploadDocumentCommand, Result<DocumentUploadResultDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;

    public UploadDocumentCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
    }

    public async Task<Result<DocumentUploadResultDto>> Handle(
        UploadDocumentCommand request,
        CancellationToken cancellationToken)
    {
        // Verify student exists
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == request.StudentId, cancellationToken);

        if (student == null)
        {
            throw new NotFoundException("Student", request.StudentId);
        }

        // Parse document type
        if (!Enum.TryParse<DocumentType>(request.Type, true, out var documentType))
        {
            documentType = DocumentType.Other;
        }

        // Upload file to storage
        var folder = $"students/{request.StudentId}";
        var filePath = await _fileStorageService.UploadFileAsync(
            request.FileContent,
            request.FileName,
            folder,
            cancellationToken);

        // Create document record
        var document = new StudentDocument
        {
            StudentId = request.StudentId,
            Type = documentType,
            Name = request.Name,
            Description = request.Description,
            FilePath = filePath,
            OriginalFileName = request.FileName,
            ContentType = request.ContentType,
            FileSize = request.FileSize,
            ExpirationDate = request.ExpirationDate
        };

        _context.StudentDocuments.Add(document);
        await _context.SaveChangesAsync(cancellationToken);

        var result = new DocumentUploadResultDto
        {
            DocumentId = document.Id,
            FileName = request.FileName,
            FileSize = request.FileSize,
            FileSizeFormatted = FormatFileSize(request.FileSize),
            DownloadUrl = _fileStorageService.GetFileUrl(filePath)
        };

        return Result<DocumentUploadResultDto>.Success(result);
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
