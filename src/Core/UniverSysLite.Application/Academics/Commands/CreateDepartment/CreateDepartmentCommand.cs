using MediatR;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Common.Security;

namespace UniverSysLite.Application.Academics.Commands.CreateDepartment;

[Authorize(Permission = "Courses.Create")]
public record CreateDepartmentCommand : IRequest<Result<Guid>>
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? HeadOfDepartmentId { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? Location { get; init; }
}
