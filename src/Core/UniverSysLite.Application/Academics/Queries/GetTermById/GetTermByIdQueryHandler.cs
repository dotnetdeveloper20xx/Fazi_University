using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.Application.Academics.Queries.GetTermById;

public class GetTermByIdQueryHandler : IRequestHandler<GetTermByIdQuery, Result<TermDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTermByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TermDto>> Handle(GetTermByIdQuery request, CancellationToken cancellationToken)
    {
        var term = await _context.Terms
            .Where(t => t.Id == request.Id)
            .Select(t => new TermDto
            {
                Id = t.Id,
                Code = t.Code,
                Name = t.Name,
                Type = t.Type.ToString(),
                AcademicYear = t.AcademicYear,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                RegistrationStartDate = t.RegistrationStartDate,
                RegistrationEndDate = t.RegistrationEndDate,
                AddDropDeadline = t.AddDropDeadline,
                WithdrawalDeadline = t.WithdrawalDeadline,
                GradesDeadline = t.GradesDeadline,
                IsCurrent = t.IsCurrent,
                IsActive = t.IsActive,
                SectionCount = t.Sections.Count(s => !s.IsDeleted),
                CreatedAt = t.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (term == null)
        {
            return Result<TermDto>.Failure("Term not found.");
        }

        return Result<TermDto>.Success(term);
    }
}
