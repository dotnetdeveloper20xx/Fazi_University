namespace UniverSysLite.Domain.Enums;

public enum AuditAction
{
    // Authentication
    Login,
    LoginFailed,
    Logout,
    TokenRefresh,
    PasswordChanged,
    PasswordResetRequested,
    PasswordReset,
    AccountLocked,
    AccountUnlocked,

    // CRUD
    Created,
    Updated,
    Deleted,
    SoftDeleted,
    Restored,

    // Security
    RoleAssigned,
    RoleRemoved,
    PermissionGranted,
    PermissionRevoked,
    ImpersonationStarted,
    ImpersonationEnded,
    AccessDenied,

    // Business Operations
    Enrolled,
    Dropped,
    GradeSubmitted,
    GradeChanged,
    PaymentProcessed,
    HoldPlaced,
    HoldReleased,
    TranscriptGenerated,

    // System
    Export,
    Import,
    BulkOperation,
    SettingsChanged,
    Error
}
