using MediatR;

namespace UniverSysLite.Domain.Common;

public interface IDomainEvent : INotification
{
    DateTime OccurredOn { get; }
}

public abstract class DomainEvent : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
