namespace UniverSysLite.Application.Identity.DTOs;

/// <summary>
/// Response returned after successful authentication.
/// </summary>
public class AuthenticationResponse
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string AccessToken { get; set; } = default!;
    public string RefreshToken { get; set; } = default!;
    public DateTime AccessTokenExpiration { get; set; }
    public DateTime RefreshTokenExpiration { get; set; }
    public IEnumerable<string> Roles { get; set; } = Enumerable.Empty<string>();
    public IEnumerable<string> Permissions { get; set; } = Enumerable.Empty<string>();
}
