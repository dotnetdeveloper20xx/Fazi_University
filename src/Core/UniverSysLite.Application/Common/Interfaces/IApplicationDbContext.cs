using Microsoft.EntityFrameworkCore;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Application.Common.Interfaces;

/// <summary>
/// Abstraction for the application database context.
/// Allows the Application layer to define what it needs without depending on EF Core implementation.
/// </summary>
public interface IApplicationDbContext
{
    // Identity entities
    DbSet<ApplicationUser> Users { get; }
    DbSet<ApplicationRole> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<UserProfile> UserProfiles { get; }
    DbSet<UserSettings> UserSettings { get; }
    DbSet<UserSession> UserSessions { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<PasswordHistory> PasswordHistories { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<UserNotificationPreference> UserNotificationPreferences { get; }
    DbSet<AuditLog> AuditLogs { get; }

    // Academic entities
    DbSet<Student> Students { get; }
    DbSet<Department> Departments { get; }
    DbSet<Program> Programs { get; }
    DbSet<Course> Courses { get; }
    DbSet<CourseSection> CourseSections { get; }
    DbSet<Term> Terms { get; }
    DbSet<Enrollment> Enrollments { get; }
    DbSet<ProgramCourse> ProgramCourses { get; }
    DbSet<CoursePrerequisite> CoursePrerequisites { get; }
    DbSet<StudentDocument> StudentDocuments { get; }

    /// <summary>
    /// Saves all changes made in this context to the database.
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
