namespace UniverSysLite.Domain.Common;

public interface ISoftDelete
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
    Guid? DeletedById { get; set; }
}
