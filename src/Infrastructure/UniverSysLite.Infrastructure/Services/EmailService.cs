using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using UniverSysLite.Application.Common.Interfaces;

namespace UniverSysLite.Infrastructure.Services;

/// <summary>
/// Email service implementation.
/// In development, logs emails instead of sending.
/// In production, would use SMTP or a service like SendGrid.
/// </summary>
public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly EmailSettings _settings;

    public EmailService(ILogger<EmailService> logger, IOptions<EmailSettings> settings)
    {
        _logger = logger;
        _settings = settings.Value;
    }

    public Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        // In development, just log the email
        _logger.LogInformation(
            "Email would be sent to {To} with subject '{Subject}'\nBody: {Body}",
            to, subject, body);

        // TODO: Implement actual email sending via SMTP or SendGrid
        // For now, this is a stub implementation

        return Task.CompletedTask;
    }

    public Task SendPasswordResetEmailAsync(string to, string resetToken, CancellationToken cancellationToken = default)
    {
        var resetUrl = $"{_settings.BaseUrl}/reset-password?token={resetToken}";
        var body = $@"
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the link below to reset it:</p>
            <p><a href='{resetUrl}'>Reset Password</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this, please ignore this email.</p>
        ";

        return SendEmailAsync(to, "Reset Your Password - UniverSys Lite", body, cancellationToken);
    }

    public Task SendEmailVerificationAsync(string to, string verificationToken, CancellationToken cancellationToken = default)
    {
        var verifyUrl = $"{_settings.BaseUrl}/verify-email?token={verificationToken}";
        var body = $@"
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering with UniverSys Lite. Please verify your email address by clicking the link below:</p>
            <p><a href='{verifyUrl}'>Verify Email</a></p>
            <p>If you didn't create an account, please ignore this email.</p>
        ";

        return SendEmailAsync(to, "Verify Your Email - UniverSys Lite", body, cancellationToken);
    }

    public Task SendWelcomeEmailAsync(string to, string userName, CancellationToken cancellationToken = default)
    {
        var body = $@"
            <h2>Welcome to UniverSys Lite!</h2>
            <p>Hello {userName},</p>
            <p>Your account has been created successfully. You can now log in and start using the system.</p>
            <p>If you have any questions, please contact your administrator.</p>
            <p>Best regards,<br/>The UniverSys Lite Team</p>
        ";

        return SendEmailAsync(to, "Welcome to UniverSys Lite", body, cancellationToken);
    }
}

/// <summary>
/// Email configuration settings.
/// </summary>
public class EmailSettings
{
    public const string SectionName = "EmailSettings";

    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SmtpUsername { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "noreply@universyslite.edu";
    public string FromName { get; set; } = "UniverSys Lite";
    public string BaseUrl { get; set; } = "https://localhost:5001";
    public bool EnableSsl { get; set; } = true;
}
