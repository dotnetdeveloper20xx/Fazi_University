using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Documents.DTOs;

namespace UniverSysLite.Application.Documents.Queries.GetDocumentStatistics;

public class GetDocumentStatisticsQueryHandler : IRequestHandler<GetDocumentStatisticsQuery, Result<DocumentStatisticsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDocumentStatisticsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DocumentStatisticsDto>> Handle(
        GetDocumentStatisticsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.StudentDocuments
            .Where(d => !d.IsDeleted)
            .AsQueryable();

        if (request.StudentId.HasValue)
        {
            query = query.Where(d => d.StudentId == request.StudentId.Value);
        }

        var today = DateTime.UtcNow.Date;

        var totalDocuments = await query.CountAsync(cancellationToken);
        var verifiedDocuments = await query.CountAsync(d => d.IsVerified, cancellationToken);
        var pendingVerification = totalDocuments - verifiedDocuments;
        var expiredDocuments = await query.CountAsync(d => d.ExpirationDate.HasValue && d.ExpirationDate < today, cancellationToken);
        var totalStorageUsed = await query.SumAsync(d => d.FileSize, cancellationToken);

        var documentsByType = await query
            .GroupBy(d => d.Type)
            .Select(g => new { Type = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.Type, x => x.Count, cancellationToken);

        var statistics = new DocumentStatisticsDto
        {
            TotalDocuments = totalDocuments,
            VerifiedDocuments = verifiedDocuments,
            PendingVerification = pendingVerification,
            ExpiredDocuments = expiredDocuments,
            TotalStorageUsed = totalStorageUsed,
            TotalStorageFormatted = FormatFileSize(totalStorageUsed),
            DocumentsByType = documentsByType
        };

        return Result<DocumentStatisticsDto>.Success(statistics);
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
