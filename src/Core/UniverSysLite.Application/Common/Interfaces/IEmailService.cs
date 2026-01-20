namespace UniverSysLite.Application.Common.Interfaces;

/// <summary>
/// Service for sending emails.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an email.
    /// </summary>
    /// <param name="to">Recipient email address.</param>
    /// <param name="subject">Email subject.</param>
    /// <param name="body">Email body (HTML).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a password reset email.
    /// </summary>
    Task SendPasswordResetEmailAsync(string to, string resetToken, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends an email verification email.
    /// </summary>
    Task SendEmailVerificationAsync(string to, string verificationToken, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a welcome email to a new user.
    /// </summary>
    Task SendWelcomeEmailAsync(string to, string userName, CancellationToken cancellationToken = default);
}
