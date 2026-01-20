using UniverSysLite.Domain.Common;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Domain.Entities.Academic;

/// <summary>
/// Represents documents associated with a student.
/// </summary>
public class StudentDocument : BaseAuditableEntity, ISoftDelete
{
    public Guid StudentId { get; set; }
    public DocumentType Type { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public string? OriginalFileName { get; set; }
    public string? ContentType { get; set; }
    public long FileSize { get; set; }
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public Guid? VerifiedById { get; set; }
    public DateTime? ExpirationDate { get; set; }

    // Soft Delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }

    // Navigation Properties
    public virtual Student Student { get; set; } = null!;
}
