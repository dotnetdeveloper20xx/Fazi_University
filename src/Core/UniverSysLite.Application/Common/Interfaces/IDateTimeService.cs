namespace UniverSysLite.Application.Common.Interfaces;

/// <summary>
/// Service for getting the current date and time.
/// Abstracts DateTime.UtcNow for testability.
/// </summary>
public interface IDateTimeService
{
    /// <summary>
    /// Gets the current UTC date and time.
    /// </summary>
    DateTime UtcNow { get; }

    /// <summary>
    /// Gets the current date (UTC).
    /// </summary>
    DateOnly Today { get; }
}
