using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities.Academic;

/// <summary>
/// Links courses to programs with requirements.
/// </summary>
public class ProgramCourse : BaseEntity
{
    public Guid ProgramId { get; set; }
    public Guid CourseId { get; set; }
    public CourseRequirementType RequirementType { get; set; } = CourseRequirementType.Required;
    public int? SemesterRecommended { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual Program Program { get; set; } = null!;
    public virtual Course Course { get; set; } = null!;
}
