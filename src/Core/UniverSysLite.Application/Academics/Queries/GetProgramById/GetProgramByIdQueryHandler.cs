using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.Application.Academics.Queries.GetProgramById;

public class GetProgramByIdQueryHandler : IRequestHandler<GetProgramByIdQuery, Result<ProgramDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProgramByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProgramDto>> Handle(GetProgramByIdQuery request, CancellationToken cancellationToken)
    {
        var program = await _context.Programs
            .Include(p => p.Department)
            .Where(p => p.Id == request.Id)
            .Select(p => new ProgramDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                Description = p.Description,
                DegreeType = p.DegreeType.ToString(),
                DepartmentId = p.DepartmentId,
                DepartmentName = p.Department.Name,
                TotalCreditsRequired = p.TotalCreditsRequired,
                DurationYears = p.DurationYears,
                TuitionPerCredit = p.TuitionPerCredit,
                IsActive = p.IsActive,
                CourseCount = p.ProgramCourses.Count(pc => pc.IsActive),
                StudentCount = _context.Students.Count(s => s.ProgramId == p.Id && !s.IsDeleted),
                CreatedAt = p.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (program == null)
        {
            return Result<ProgramDto>.Failure("Program not found.");
        }

        return Result<ProgramDto>.Success(program);
    }
}
