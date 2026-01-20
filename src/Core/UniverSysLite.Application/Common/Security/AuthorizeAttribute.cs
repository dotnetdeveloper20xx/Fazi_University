namespace UniverSysLite.Application.Common.Security;

/// <summary>
/// Specifies that the request handler requires authorization.
/// Can specify required roles or permissions.
/// </summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
public class AuthorizeAttribute : Attribute
{
    /// <summary>
    /// Gets or sets the comma-separated list of roles that are allowed to execute this request.
    /// </summary>
    public string? Roles { get; set; }

    /// <summary>
    /// Gets or sets the permission required to execute this request.
    /// Use format "Module.Action" (e.g., "Students.Create", "Grades.Edit").
    /// </summary>
    public string? Permission { get; set; }

    public AuthorizeAttribute() { }

    public AuthorizeAttribute(string permission)
    {
        Permission = permission;
    }
}
