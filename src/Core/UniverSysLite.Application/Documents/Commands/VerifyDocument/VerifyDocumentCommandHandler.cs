using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.Application.Documents.Commands.VerifyDocument;

public class VerifyDocumentCommandHandler : IRequestHandler<VerifyDocumentCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public VerifyDocumentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<bool>> Handle(VerifyDocumentCommand request, CancellationToken cancellationToken)
    {
        var document = await _context.StudentDocuments
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId && !d.IsDeleted, cancellationToken);

        if (document == null)
        {
            throw new NotFoundException("Document", request.DocumentId);
        }

        document.IsVerified = request.IsVerified;

        if (request.IsVerified)
        {
            document.VerifiedAt = DateTime.UtcNow;
            document.VerifiedById = _currentUserService.UserId;
        }
        else
        {
            document.VerifiedAt = null;
            document.VerifiedById = null;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
