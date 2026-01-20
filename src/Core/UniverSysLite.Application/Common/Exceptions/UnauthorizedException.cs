namespace UniverSysLite.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when authentication is required but not provided.
/// </summary>
public class UnauthorizedException : Exception
{
    public UnauthorizedException()
        : base("Authentication is required to access this resource.")
    {
    }

    public UnauthorizedException(string message)
        : base(message)
    {
    }
}
