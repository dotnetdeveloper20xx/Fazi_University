using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.UpdateDepartment;

[Authorize(Permission = "Courses.Edit")]
public record UpdateDepartmentCommand : IRequest<Result>
{
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public Guid? HeadOfDepartmentId { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? Location { get; init; }
    public bool? IsActive { get; init; }
}
