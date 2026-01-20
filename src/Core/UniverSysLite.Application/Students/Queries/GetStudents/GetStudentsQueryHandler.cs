using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Students.DTOs;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Students.Queries.GetStudents;

public class GetStudentsQueryHandler : IRequestHandler<GetStudentsQuery, Result<PaginatedList<StudentListDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<StudentListDto>>> Handle(GetStudentsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Students
            .AsNoTracking()
            .Include(s => s.Program)
            .Include(s => s.Department)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(s =>
                s.StudentId.ToLower().Contains(searchTerm) ||
                s.FirstName.ToLower().Contains(searchTerm) ||
                s.LastName.ToLower().Contains(searchTerm) ||
                s.Email.ToLower().Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(request.Status) &&
            Enum.TryParse<StudentStatus>(request.Status, true, out var status))
        {
            query = query.Where(s => s.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(request.Type) &&
            Enum.TryParse<StudentType>(request.Type, true, out var type))
        {
            query = query.Where(s => s.Type == type);
        }

        if (request.ProgramId.HasValue)
        {
            query = query.Where(s => s.ProgramId == request.ProgramId.Value);
        }

        if (request.DepartmentId.HasValue)
        {
            query = query.Where(s => s.DepartmentId == request.DepartmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.AcademicStanding) &&
            Enum.TryParse<AcademicStanding>(request.AcademicStanding, true, out var standing))
        {
            query = query.Where(s => s.AcademicStanding == standing);
        }

        if (request.HasHold.HasValue && request.HasHold.Value)
        {
            query = query.Where(s => s.HasFinancialHold || s.HasAcademicHold);
        }

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "studentid" => request.SortDescending ? query.OrderByDescending(s => s.StudentId) : query.OrderBy(s => s.StudentId),
            "name" or "firstname" => request.SortDescending ? query.OrderByDescending(s => s.FirstName) : query.OrderBy(s => s.FirstName),
            "lastname" => request.SortDescending ? query.OrderByDescending(s => s.LastName) : query.OrderBy(s => s.LastName),
            "email" => request.SortDescending ? query.OrderByDescending(s => s.Email) : query.OrderBy(s => s.Email),
            "gpa" => request.SortDescending ? query.OrderByDescending(s => s.CumulativeGpa) : query.OrderBy(s => s.CumulativeGpa),
            "status" => request.SortDescending ? query.OrderByDescending(s => s.Status) : query.OrderBy(s => s.Status),
            _ => request.SortDescending ? query.OrderByDescending(s => s.CreatedAt) : query.OrderBy(s => s.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var students = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new StudentListDto
            {
                Id = s.Id,
                StudentId = s.StudentId,
                FirstName = s.FirstName,
                LastName = s.LastName,
                FullName = $"{s.FirstName} {s.LastName}".Trim(),
                Email = s.Email,
                Phone = s.Phone,
                Status = s.Status.ToString(),
                Type = s.Type.ToString(),
                ProgramName = s.Program != null ? s.Program.Name : null,
                DepartmentName = s.Department != null ? s.Department.Name : null,
                CumulativeGpa = s.CumulativeGpa,
                AcademicStanding = s.AcademicStanding.ToString(),
                HasFinancialHold = s.HasFinancialHold,
                HasAcademicHold = s.HasAcademicHold,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var paginatedList = new PaginatedList<StudentListDto>(
            students, totalCount, request.PageNumber, request.PageSize);

        return Result<PaginatedList<StudentListDto>>.Success(paginatedList);
    }
}
