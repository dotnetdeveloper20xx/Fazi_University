using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Documents.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Documents.Queries.GetStudentDocuments;

public class GetStudentDocumentsQueryHandler : IRequestHandler<GetStudentDocumentsQuery, Result<PaginatedList<StudentDocumentListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentDocumentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<StudentDocumentListDto>>> Handle(
        GetStudentDocumentsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.StudentDocuments
            .Where(d => d.StudentId == request.StudentId && !d.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.Type) && Enum.TryParse<DocumentType>(request.Type, true, out var docType))
        {
            query = query.Where(d => d.Type == docType);
        }

        if (request.IsVerified.HasValue)
        {
            query = query.Where(d => d.IsVerified == request.IsVerified.Value);
        }

        if (!request.IncludeExpired)
        {
            var today = DateTime.UtcNow.Date;
            query = query.Where(d => d.ExpirationDate == null || d.ExpirationDate > today);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var documents = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(d => new StudentDocumentListDto
            {
                Id = d.Id,
                Type = d.Type.ToString(),
                Name = d.Name,
                OriginalFileName = d.OriginalFileName,
                FileSizeFormatted = FormatFileSize(d.FileSize),
                IsVerified = d.IsVerified,
                ExpirationDate = d.ExpirationDate,
                IsExpired = d.ExpirationDate.HasValue && d.ExpirationDate.Value < DateTime.UtcNow.Date,
                CreatedAt = d.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var result = new PaginatedList<StudentDocumentListDto>(documents, totalCount, request.PageNumber, request.PageSize);
        return Result<PaginatedList<StudentDocumentListDto>>.Success(result);
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
