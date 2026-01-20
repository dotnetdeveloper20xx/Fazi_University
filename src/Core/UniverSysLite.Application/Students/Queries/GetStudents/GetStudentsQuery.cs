using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;
using UniverSysLite.Application.Students.DTOs;

namespace UniverSysLite.Application.Students.Queries.GetStudents;

[Authorize(Permission = "Students.View")]
public record GetStudentsQuery : IRequest<Result<PaginatedList<StudentListDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? Status { get; init; }
    public string? Type { get; init; }
    public Guid? ProgramId { get; init; }
    public Guid? DepartmentId { get; init; }
    public string? AcademicStanding { get; init; }
    public bool? HasHold { get; init; }
    public string? SortBy { get; init; } = "CreatedAt";
    public bool SortDescending { get; init; } = true;
}
