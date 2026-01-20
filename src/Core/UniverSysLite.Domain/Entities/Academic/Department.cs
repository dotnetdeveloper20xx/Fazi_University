using UniverSysLite.Domain.Common;

namespace UniverSysLite.Domain.Entities.Academic;

/// <summary>
/// Represents an academic department.
/// </summary>
public class Department : BaseAuditableEntity, ISoftDelete
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? HeadOfDepartmentId { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Location { get; set; }
    public bool IsActive { get; set; } = true;

    // Soft Delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }

    // Navigation Properties
    public virtual ICollection<Program> Programs { get; set; } = new List<Program>();
    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
    public virtual ICollection<Student> Students { get; set; } = new List<Student>();
}
