using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Documents.Commands.DeleteDocument;
using UniverSysLite.Application.Documents.Commands.UploadDocument;
using UniverSysLite.Application.Documents.Commands.VerifyDocument;
using UniverSysLite.Application.Documents.DTOs;
using UniverSysLite.Application.Documents.Queries.GetDocumentById;
using UniverSysLite.Application.Documents.Queries.GetDocumentStatistics;
using UniverSysLite.Application.Documents.Queries.GetStudentDocuments;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Controller for managing student documents.
/// </summary>
[Authorize]
public class DocumentsController : BaseApiController
{
    private readonly IFileStorageService _fileStorageService;

    public DocumentsController(IFileStorageService fileStorageService)
    {
        _fileStorageService = fileStorageService;
    }

    /// <summary>
    /// Get documents for a student.
    /// </summary>
    [HttpGet("student/{studentId}")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<StudentDocumentListDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStudentDocuments(
        Guid studentId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? type = null,
        [FromQuery] bool? isVerified = null,
        [FromQuery] bool includeExpired = true)
    {
        var query = new GetStudentDocumentsQuery
        {
            StudentId = studentId,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Type = type,
            IsVerified = isVerified,
            IncludeExpired = includeExpired
        };

        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<PaginatedList<StudentDocumentListDto>>.Ok(result.Value, "Documents retrieved successfully"));
    }

    /// <summary>
    /// Get a document by ID.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<StudentDocumentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocument(Guid id)
    {
        var query = new GetDocumentByIdQuery { DocumentId = id };
        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<StudentDocumentDto>.Ok(result.Value, "Document retrieved successfully"));
    }

    /// <summary>
    /// Upload a document for a student.
    /// </summary>
    [HttpPost("student/{studentId}")]
    [ProducesResponseType(typeof(ApiResponse<DocumentUploadResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UploadDocument(
        Guid studentId,
        [FromForm] IFormFile file,
        [FromForm] string name,
        [FromForm] string type = "Other",
        [FromForm] string? description = null,
        [FromForm] DateTime? expirationDate = null)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("No file uploaded"));
        }

        using var stream = file.OpenReadStream();

        var command = new UploadDocumentCommand
        {
            StudentId = studentId,
            Type = type,
            Name = name,
            Description = description,
            FileName = file.FileName,
            ContentType = file.ContentType,
            FileContent = stream,
            FileSize = file.Length,
            ExpirationDate = expirationDate
        };

        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<DocumentUploadResultDto>.Ok(result.Value, "Document uploaded successfully"));
    }

    /// <summary>
    /// Verify or unverify a document.
    /// </summary>
    [HttpPut("{id}/verify")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifyDocument(Guid id, [FromBody] VerifyDocumentRequest request)
    {
        var command = new VerifyDocumentCommand
        {
            DocumentId = id,
            IsVerified = request.IsVerified
        };

        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        var message = request.IsVerified ? "Document verified successfully" : "Document verification removed";
        return Ok(ApiResponse<string>.Ok("Success", message));
    }

    /// <summary>
    /// Delete a document.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteDocument(Guid id)
    {
        var command = new DeleteDocumentCommand { DocumentId = id };
        var result = await Mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<string>.Ok("Deleted", "Document deleted successfully"));
    }

    /// <summary>
    /// Get document statistics.
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ApiResponse<DocumentStatisticsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics([FromQuery] Guid? studentId = null)
    {
        var query = new GetDocumentStatisticsQuery { StudentId = studentId };
        var result = await Mediator.Send(query);

        if (!result.Succeeded)
        {
            return BadRequest(ApiResponse<object>.Fail(result.Errors));
        }

        return Ok(ApiResponse<DocumentStatisticsDto>.Ok(result.Value, "Statistics retrieved successfully"));
    }

    /// <summary>
    /// Download a document file.
    /// </summary>
    [HttpGet("download")]
    public async Task<IActionResult> DownloadFile([FromQuery] string path)
    {
        if (string.IsNullOrEmpty(path))
        {
            return BadRequest("File path is required");
        }

        try
        {
            var exists = await _fileStorageService.FileExistsAsync(path);
            if (!exists)
            {
                return NotFound("File not found");
            }

            var stream = await _fileStorageService.DownloadFileAsync(path);
            var fileName = Path.GetFileName(path);
            var contentType = GetContentType(fileName);

            return File(stream, contentType, fileName);
        }
        catch (FileNotFoundException)
        {
            return NotFound("File not found");
        }
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            _ => "application/octet-stream"
        };
    }
}

public record VerifyDocumentRequest
{
    public bool IsVerified { get; init; }
}
