using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Infrastructure.Persistence;

/// <summary>
/// Database seeder for initial data including roles, permissions, and admin user.
/// </summary>
public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IServiceProvider serviceProvider)
    {
        // Ensure database is created
        await context.Database.MigrateAsync();

        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<ApplicationRole>>();

        // Seed permissions
        await SeedPermissionsAsync(context);

        // Seed roles
        await SeedRolesAsync(roleManager);

        // Assign permissions to roles
        await AssignPermissionsToRolesAsync(context);

        // Seed admin user
        await SeedAdminUserAsync(userManager, context);
    }

    private static async Task SeedPermissionsAsync(ApplicationDbContext context)
    {
        if (await context.Permissions.AnyAsync())
            return;

        var permissions = new List<Permission>
        {
            // User Management
            new() { Name = "Users.View", DisplayName = "View Users", Module = "Users", Action = "View", IsSystem = true },
            new() { Name = "Users.Create", DisplayName = "Create Users", Module = "Users", Action = "Create", IsSystem = true },
            new() { Name = "Users.Edit", DisplayName = "Edit Users", Module = "Users", Action = "Edit", IsSystem = true },
            new() { Name = "Users.Delete", DisplayName = "Delete Users", Module = "Users", Action = "Delete", IsSystem = true },

            // Role Management
            new() { Name = "Roles.View", DisplayName = "View Roles", Module = "Roles", Action = "View", IsSystem = true },
            new() { Name = "Roles.Create", DisplayName = "Create Roles", Module = "Roles", Action = "Create", IsSystem = true },
            new() { Name = "Roles.Edit", DisplayName = "Edit Roles", Module = "Roles", Action = "Edit", IsSystem = true },
            new() { Name = "Roles.Delete", DisplayName = "Delete Roles", Module = "Roles", Action = "Delete", IsSystem = true },
            new() { Name = "Roles.AssignPermissions", DisplayName = "Assign Permissions to Roles", Module = "Roles", Action = "AssignPermissions", IsSystem = true },

            // Student Management
            new() { Name = "Students.View", DisplayName = "View Students", Module = "Students", Action = "View", IsSystem = true },
            new() { Name = "Students.Create", DisplayName = "Create Students", Module = "Students", Action = "Create", IsSystem = true },
            new() { Name = "Students.Edit", DisplayName = "Edit Students", Module = "Students", Action = "Edit", IsSystem = true },
            new() { Name = "Students.Delete", DisplayName = "Delete Students", Module = "Students", Action = "Delete", IsSystem = true },

            // Course Management
            new() { Name = "Courses.View", DisplayName = "View Courses", Module = "Courses", Action = "View", IsSystem = true },
            new() { Name = "Courses.Create", DisplayName = "Create Courses", Module = "Courses", Action = "Create", IsSystem = true },
            new() { Name = "Courses.Edit", DisplayName = "Edit Courses", Module = "Courses", Action = "Edit", IsSystem = true },
            new() { Name = "Courses.Delete", DisplayName = "Delete Courses", Module = "Courses", Action = "Delete", IsSystem = true },

            // Grade Management
            new() { Name = "Grades.View", DisplayName = "View Grades", Module = "Grades", Action = "View", IsSystem = true },
            new() { Name = "Grades.Create", DisplayName = "Create Grades", Module = "Grades", Action = "Create", IsSystem = true },
            new() { Name = "Grades.Edit", DisplayName = "Edit Grades", Module = "Grades", Action = "Edit", IsSystem = true },
            new() { Name = "Grades.Delete", DisplayName = "Delete Grades", Module = "Grades", Action = "Delete", IsSystem = true },

            // Billing Management
            new() { Name = "Billing.View", DisplayName = "View Billing", Module = "Billing", Action = "View", IsSystem = true },
            new() { Name = "Billing.Create", DisplayName = "Create Billing Records", Module = "Billing", Action = "Create", IsSystem = true },
            new() { Name = "Billing.Edit", DisplayName = "Edit Billing Records", Module = "Billing", Action = "Edit", IsSystem = true },
            new() { Name = "Billing.Delete", DisplayName = "Delete Billing Records", Module = "Billing", Action = "Delete", IsSystem = true },
            new() { Name = "Billing.ProcessPayments", DisplayName = "Process Payments", Module = "Billing", Action = "ProcessPayments", IsSystem = true },

            // Report Access
            new() { Name = "Reports.View", DisplayName = "View Reports", Module = "Reports", Action = "View", IsSystem = true },
            new() { Name = "Reports.Export", DisplayName = "Export Reports", Module = "Reports", Action = "Export", IsSystem = true },

            // Audit Logs
            new() { Name = "AuditLogs.View", DisplayName = "View Audit Logs", Module = "AuditLogs", Action = "View", IsSystem = true },

            // Settings
            new() { Name = "Settings.View", DisplayName = "View Settings", Module = "Settings", Action = "View", IsSystem = true },
            new() { Name = "Settings.Edit", DisplayName = "Edit Settings", Module = "Settings", Action = "Edit", IsSystem = true }
        };

        context.Permissions.AddRange(permissions);
        await context.SaveChangesAsync();
    }

    private static async Task SeedRolesAsync(RoleManager<ApplicationRole> roleManager)
    {
        var roles = new List<(string Name, string Description, bool IsSystem)>
        {
            ("Administrator", "Full system access with all permissions", true),
            ("Registrar", "Manages student records and enrollments", true),
            ("Faculty", "Course instructors with grade management access", true),
            ("BillingStaff", "Manages billing and payment processing", true),
            ("Student", "Student access to view grades and billing", true),
            ("ReadOnly", "Read-only access for auditing purposes", true)
        };

        foreach (var (name, description, isSystem) in roles)
        {
            if (!await roleManager.RoleExistsAsync(name))
            {
                var role = new ApplicationRole(name)
                {
                    Description = description,
                    IsSystem = isSystem,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                await roleManager.CreateAsync(role);
            }
        }
    }

    private static async Task AssignPermissionsToRolesAsync(ApplicationDbContext context)
    {
        if (await context.RolePermissions.AnyAsync())
            return;

        var permissions = await context.Permissions.ToListAsync();
        var roles = await context.Roles.ToListAsync();

        var rolePermissionAssignments = new Dictionary<string, string[]>
        {
            ["Administrator"] = permissions.Select(p => p.Name).ToArray(), // All permissions
            ["Registrar"] = new[]
            {
                "Users.View", "Students.View", "Students.Create", "Students.Edit", "Students.Delete",
                "Courses.View", "Grades.View", "Reports.View", "Reports.Export"
            },
            ["Faculty"] = new[]
            {
                "Students.View", "Courses.View", "Grades.View", "Grades.Create", "Grades.Edit",
                "Reports.View"
            },
            ["BillingStaff"] = new[]
            {
                "Students.View", "Billing.View", "Billing.Create", "Billing.Edit", "Billing.Delete",
                "Billing.ProcessPayments", "Reports.View", "Reports.Export"
            },
            ["Student"] = new[]
            {
                "Grades.View", "Billing.View"
            },
            ["ReadOnly"] = new[]
            {
                "Users.View", "Students.View", "Courses.View", "Grades.View", "Billing.View",
                "Reports.View", "AuditLogs.View"
            }
        };

        var rolePermissions = new List<RolePermission>();

        foreach (var (roleName, permissionNames) in rolePermissionAssignments)
        {
            var role = roles.FirstOrDefault(r => r.Name == roleName);
            if (role == null) continue;

            foreach (var permissionName in permissionNames)
            {
                var permission = permissions.FirstOrDefault(p => p.Name == permissionName);
                if (permission == null) continue;

                rolePermissions.Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = permission.Id
                });
            }
        }

        context.RolePermissions.AddRange(rolePermissions);
        await context.SaveChangesAsync();
    }

    private static async Task SeedAdminUserAsync(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
    {
        const string adminEmail = "admin@universyslite.edu";

        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser != null)
            return;

        adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true,
            FirstName = "System",
            LastName = "Administrator",
            DisplayName = "Admin",
            IsActive = true,
            MustChangePassword = false,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(adminUser, "Admin@123!");

        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Administrator");

            // Create user profile
            var profile = new UserProfile
            {
                UserId = adminUser.Id,
                Bio = "System Administrator Account"
            };
            context.UserProfiles.Add(profile);

            // Create user settings
            var settings = new UserSettings
            {
                UserId = adminUser.Id
            };
            context.UserSettings.Add(settings);

            await context.SaveChangesAsync();
        }
    }
}
