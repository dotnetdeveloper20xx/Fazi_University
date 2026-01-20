namespace UniverSysLite.Application.Documents.DTOs;

public record StudentDocumentDto
{
    public Guid Id { get; init; }
    public Guid StudentId { get; init; }
    public string StudentName { get; init; } = string.Empty;
    public string StudentNumber { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? OriginalFileName { get; init; }
    public string? ContentType { get; init; }
    public long FileSize { get; init; }
    public string FileSizeFormatted { get; init; } = string.Empty;
    public bool IsVerified { get; init; }
    public DateTime? VerifiedAt { get; init; }
    public string? VerifiedByName { get; init; }
    public DateTime? ExpirationDate { get; init; }
    public bool IsExpired { get; init; }
    public DateTime CreatedAt { get; init; }
    public string? DownloadUrl { get; init; }
}

public record StudentDocumentListDto
{
    public Guid Id { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? OriginalFileName { get; init; }
    public string FileSizeFormatted { get; init; } = string.Empty;
    public bool IsVerified { get; init; }
    public DateTime? ExpirationDate { get; init; }
    public bool IsExpired { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record DocumentUploadResultDto
{
    public Guid DocumentId { get; init; }
    public string FileName { get; init; } = string.Empty;
    public long FileSize { get; init; }
    public string FileSizeFormatted { get; init; } = string.Empty;
    public string? DownloadUrl { get; init; }
}

public record DocumentStatisticsDto
{
    public int TotalDocuments { get; init; }
    public int VerifiedDocuments { get; init; }
    public int PendingVerification { get; init; }
    public int ExpiredDocuments { get; init; }
    public long TotalStorageUsed { get; init; }
    public string TotalStorageFormatted { get; init; } = string.Empty;
    public Dictionary<string, int> DocumentsByType { get; init; } = new();
}
