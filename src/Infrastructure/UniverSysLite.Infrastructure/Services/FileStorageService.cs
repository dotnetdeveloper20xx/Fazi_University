using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using UniverSysLite.Application.Common.Interfaces;

namespace UniverSysLite.Infrastructure.Services;

/// <summary>
/// Local file storage service implementation.
/// In production, this could be replaced with Azure Blob Storage, AWS S3, etc.
/// </summary>
public class FileStorageService : IFileStorageService
{
    private readonly ILogger<FileStorageService> _logger;
    private readonly FileStorageSettings _settings;

    public FileStorageService(ILogger<FileStorageService> logger, IOptions<FileStorageSettings> settings)
    {
        _logger = logger;
        _settings = settings.Value;

        // Ensure storage directory exists
        if (!Directory.Exists(_settings.BasePath))
        {
            Directory.CreateDirectory(_settings.BasePath);
        }
    }

    public async Task<string> UploadFileAsync(Stream content, string fileName, string? folder = null, CancellationToken cancellationToken = default)
    {
        // Generate a unique file name to avoid collisions
        var extension = Path.GetExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";

        // Build the storage path
        var relativePath = string.IsNullOrEmpty(folder)
            ? uniqueFileName
            : Path.Combine(folder, uniqueFileName);

        var fullPath = Path.Combine(_settings.BasePath, relativePath);

        // Ensure directory exists
        var directory = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        // Save the file
        using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        await content.CopyToAsync(fileStream, cancellationToken);

        _logger.LogInformation("File uploaded: {FileName} -> {Path}", fileName, relativePath);

        return relativePath;
    }

    public async Task<Stream> DownloadFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_settings.BasePath, filePath);

        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException($"File not found: {filePath}");
        }

        var memoryStream = new MemoryStream();
        using var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        await fileStream.CopyToAsync(memoryStream, cancellationToken);
        memoryStream.Position = 0;

        return memoryStream;
    }

    public Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_settings.BasePath, filePath);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("File deleted: {Path}", filePath);
        }

        return Task.CompletedTask;
    }

    public Task<bool> FileExistsAsync(string filePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_settings.BasePath, filePath);
        return Task.FromResult(File.Exists(fullPath));
    }

    public string? GetFileUrl(string filePath)
    {
        // For local storage, return a relative URL that can be served by the API
        return $"/api/documents/download?path={Uri.EscapeDataString(filePath)}";
    }
}

/// <summary>
/// File storage configuration settings.
/// </summary>
public class FileStorageSettings
{
    public const string SectionName = "FileStorage";

    public string BasePath { get; set; } = "./uploads";
    public long MaxFileSizeBytes { get; set; } = 10 * 1024 * 1024; // 10 MB
    public string[] AllowedExtensions { get; set; } = new[] { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif" };
}
