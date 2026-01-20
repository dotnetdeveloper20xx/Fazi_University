using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Academics.DTOs;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;

namespace UniverSysLite.Application.Academics.Queries.GetDepartmentById;

public class GetDepartmentByIdQueryHandler : IRequestHandler<GetDepartmentByIdQuery, Result<DepartmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDepartmentByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DepartmentDto>> Handle(GetDepartmentByIdQuery request, CancellationToken cancellationToken)
    {
        var department = await _context.Departments
            .Where(d => d.Id == request.Id)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name,
                Description = d.Description,
                HeadOfDepartmentId = d.HeadOfDepartmentId,
                HeadOfDepartmentName = d.HeadOfDepartmentId != null ?
                    _context.Users.Where(u => u.Id == d.HeadOfDepartmentId).Select(u => u.FirstName + " " + u.LastName).FirstOrDefault() : null,
                Phone = d.Phone,
                Email = d.Email,
                Location = d.Location,
                IsActive = d.IsActive,
                ProgramCount = d.Programs.Count(p => !p.IsDeleted),
                CourseCount = d.Courses.Count(c => !c.IsDeleted),
                StudentCount = _context.Students.Count(s => s.DepartmentId == d.Id && !s.IsDeleted),
                CreatedAt = d.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (department == null)
        {
            return Result<DepartmentDto>.Failure("Department not found.");
        }

        return Result<DepartmentDto>.Success(department);
    }
}
