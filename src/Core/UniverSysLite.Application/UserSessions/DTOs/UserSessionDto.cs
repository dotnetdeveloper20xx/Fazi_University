namespace UniverSysLite.Application.UserSessions.DTOs;

/// <summary>
/// User session information DTO.
/// </summary>
public class UserSessionDto
{
    public Guid Id { get; set; }
    public string DeviceInfo { get; set; } = string.Empty;
    public string Browser { get; set; } = string.Empty;
    public string OperatingSystem { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime LoginAt { get; set; }
    public DateTime LastActivityAt { get; set; }
    public bool IsActive { get; set; }
    public bool IsCurrentSession { get; set; }
}
