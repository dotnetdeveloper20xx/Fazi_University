namespace UniverSysLite.Application.Common.Interfaces;

/// <summary>
/// Service for storing and retrieving files.
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Uploads a file and returns the storage path.
    /// </summary>
    /// <param name="content">The file content.</param>
    /// <param name="fileName">The original file name.</param>
    /// <param name="folder">Optional folder within storage.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The storage path of the uploaded file.</returns>
    Task<string> UploadFileAsync(Stream content, string fileName, string? folder = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads a file from storage.
    /// </summary>
    /// <param name="filePath">The storage path of the file.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The file content stream.</returns>
    Task<Stream> DownloadFileAsync(string filePath, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a file from storage.
    /// </summary>
    /// <param name="filePath">The storage path of the file.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a file exists in storage.
    /// </summary>
    /// <param name="filePath">The storage path of the file.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the file exists, false otherwise.</returns>
    Task<bool> FileExistsAsync(string filePath, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the public URL for a file (if applicable).
    /// </summary>
    /// <param name="filePath">The storage path of the file.</param>
    /// <returns>The public URL, or null if not applicable.</returns>
    string? GetFileUrl(string filePath);
}
