using UniverSysLite.Application.Common.Interfaces;

namespace UniverSysLite.Infrastructure.Services;

/// <summary>
/// Service for getting the current date and time.
/// Abstracts DateTime.UtcNow for easier testing.
/// </summary>
public class DateTimeService : IDateTimeService
{
    public DateTime UtcNow => DateTime.UtcNow;

    public DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);
}
