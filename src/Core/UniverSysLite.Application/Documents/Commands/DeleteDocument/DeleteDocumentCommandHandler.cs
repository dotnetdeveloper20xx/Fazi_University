using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.Application.Documents.Commands.DeleteDocument;

public class DeleteDocumentCommandHandler : IRequestHandler<DeleteDocumentCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly ICurrentUserService _currentUserService;

    public DeleteDocumentCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorageService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<bool>> Handle(DeleteDocumentCommand request, CancellationToken cancellationToken)
    {
        var document = await _context.StudentDocuments
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId && !d.IsDeleted, cancellationToken);

        if (document == null)
        {
            throw new NotFoundException("Document", request.DocumentId);
        }

        // Soft delete the document
        document.IsDeleted = true;
        document.DeletedAt = DateTime.UtcNow;
        document.DeletedById = _currentUserService.UserId;

        await _context.SaveChangesAsync(cancellationToken);

        // Optionally delete from file storage
        // await _fileStorageService.DeleteFileAsync(document.FilePath, cancellationToken);

        return Result<bool>.Success(true);
    }
}
