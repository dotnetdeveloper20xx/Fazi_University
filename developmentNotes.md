# UniverSys Lite - Development Notes
## Developer Log & Implementation Journal

---

# 🔖 RESUME POINT - January 20, 2026 (Updated - Sprint 1 COMPLETE!)

## Where We Left Off
**Sprint**: Sprint 1 - Solution Architecture & Infrastructure - **COMPLETE**
**Current Task**: Ready for Sprint 2 - Enterprise User Management
**Status**: ALL LAYERS COMPLETE - API RUNNING AND TESTED

## What Was Completed - Sprint 1 Summary
1. ✅ Solution structure created (4 projects with Clean Architecture)
2. ✅ All NuGet packages installed
3. ✅ **Domain layer fully created** (Day 1)
4. ✅ **Application layer fully created** (Day 2)
5. ✅ **Infrastructure layer fully created** (Day 2)
6. ✅ **API layer fully created** (Day 3):
   - `Program.cs` with full configuration (Serilog, CORS, Swagger, Health Checks)
   - `appsettings.json` / `appsettings.Development.json` with JWT, Email, CORS settings
   - `ExceptionHandlingMiddleware` - Global exception handling
   - `BaseApiController` - Base controller with MediatR
   - `AuthController` - Login, Register, RefreshToken, GetCurrentUser endpoints
   - `DatabaseSeeder` - Roles, permissions, admin user seeding
   - Application exceptions: ValidationException, NotFoundException, ForbiddenAccessException, UnauthorizedException
7. ✅ **Initial EF Core migration created** (InitialCreate)
8. ✅ **Database seeded successfully**:
   - 6 Roles: Administrator, Registrar, Faculty, BillingStaff, Student, ReadOnly
   - 32 Permissions across 9 modules (Users, Roles, Students, Courses, Grades, Billing, Reports, AuditLogs, Settings)
   - Admin user: admin@universyslite.edu / Admin@123!
9. ✅ **All API endpoints tested and working**:
   - POST /api/auth/login - Returns JWT + refresh token with roles and permissions
   - POST /api/auth/register - Creates user with Student role
   - POST /api/auth/refresh-token - Token refresh
   - GET /api/auth/me - Get current user (authenticated)
   - GET /health - Health check
   - GET /swagger - Swagger UI

## Next Steps (Sprint 2)
1. Create Users CRUD (Commands/Queries/Controller)
2. Implement user profiles management
3. Implement user settings management
4. Create user session management
5. Build React frontend with login page

## Key File Locations
- Solution: `UniverSysLite.sln`
- Domain: `src/Core/UniverSysLite.Domain/`
- Application: `src/Core/UniverSysLite.Application/`
- Infrastructure: `src/Infrastructure/UniverSysLite.Infrastructure/`
- API: `src/Presentation/UniverSysLite.API/`

---

# PROJECT METADATA

| Field | Value |
|-------|-------|
| **Project Name** | UniverSys Lite |
| **Start Date** | January 2026 |
| **Developer** | [Your Name] |
| **AI Assistant** | Claude Opus 4.5 |
| **Repository** | C:\Users\AfzalAhmed\source\repos\dotnetdeveloper20xx\UniversityCorpporateSoftware |

---

# TABLE OF CONTENTS

1. [Pre-Development Planning](#pre-development-planning)
2. [Architecture Decisions](#architecture-decisions)
3. [Sprint 1 Log](#sprint-1-solution-architecture--infrastructure)
4. [Sprint 2 Log](#sprint-2-enterprise-user-management)
5. [Sprint 3 Log](#sprint-3-roles-permissions--audit-system)
6. [Sprint 4 Log](#sprint-4-student-management--notifications)
7. [Sprint 5 Log](#sprint-5-courses--registration)
8. [Sprint 6 Log](#sprint-6-grading--billing)
9. [Sprint 7 Log](#sprint-7-transcripts-reports--polish)
10. [Issues & Resolutions](#issues--resolutions)
11. [Lessons Learned](#lessons-learned)
12. [Useful Commands & Scripts](#useful-commands--scripts)
13. [Reference Links](#reference-links)

---

# PRE-DEVELOPMENT PLANNING

## Initial Requirements Gathering
**Date**: January 19, 2026

### Original Vision
- Started with two prompt documents:
  1. `CLAUDE_CODE_PROMPT_UniversityManagementSystem.md` - Full-scale 15+ module system (30-month timeline)
  2. `CLAUDE_CODE_PROMPT_UniverSysLite_ProjectDelivery.md` - Right-sized 5-module version (6 sprints)

### Final Scope Decision
After discussion, we settled on:
- **5 Core Modules**: User Management, Student Management, Course/Registration, Grading/Transcripts, Billing
- **Goal**: Portfolio showcase project
- **UI**: Modern React (not Blazor as originally proposed)

### Architecture Decisions Made
1. **Full Controllers** over Minimal APIs - better for demonstrating enterprise patterns
2. **CQRS with MediatR** - industry-standard pattern for complex applications
3. **SQL Server** - enterprise database (not SQLite/PostgreSQL)
4. **Enterprise User Management** - financial-grade features:
   - User profiles, settings, themes
   - Password management with history
   - Session management
   - Notification system
   - Granular permissions (not just roles)
   - Financial-grade audit logging

---

# ARCHITECTURE DECISIONS

## ADR-001: Database Choice - SQL Server
**Date**: January 19, 2026
**Status**: Accepted

**Context**: Need a database for the University Management System.

**Decision**: Use SQL Server 2022 (LocalDB for development).

**Rationale**:
- Enterprise-standard database
- Excellent EF Core support
- Portfolio projects benefit from showing SQL Server experience
- LocalDB requires no installation for developers

**Consequences**:
- Windows-focused development (LocalDB)
- Can migrate to Azure SQL for cloud deployment

---

## ADR-002: CQRS with MediatR
**Date**: January 19, 2026
**Status**: Accepted

**Context**: Need to structure application layer for maintainability and testability.

**Decision**: Implement CQRS pattern using MediatR library.

**Rationale**:
- Separates read/write concerns
- Each use case is a single class (Command/Query + Handler)
- Pipeline behaviors for cross-cutting concerns
- Highly testable - each handler can be unit tested in isolation
- Industry-recognized pattern

**Consequences**:
- More files (Command, Handler, Validator per operation)
- Learning curve for developers unfamiliar with pattern
- Worth it for maintainability

---

## ADR-003: Full Controllers vs Minimal APIs
**Date**: January 19, 2026
**Status**: Accepted

**Context**: ASP.NET Core 8 offers both Minimal APIs and traditional Controllers.

**Decision**: Use full Controller classes with `[ApiController]` attribute.

**Rationale**:
- Better organization for large APIs
- Familiar pattern for enterprise developers
- Better for demonstrating RESTful design in portfolio
- Swagger/OpenAPI integration is cleaner
- Easier to apply attributes (authorization, filters)

**Consequences**:
- Slightly more boilerplate than Minimal APIs
- More familiar to hiring managers reviewing portfolio

---

## ADR-004: Permission-Based Authorization
**Date**: January 19, 2026
**Status**: Accepted

**Context**: Need authorization beyond simple role checks.

**Decision**: Implement granular permission system with:
- Permissions table (Module.Action format)
- RolePermissions junction table
- Custom `[RequirePermission]` attribute
- MediatR AuthorizationBehavior

**Rationale**:
- Roles alone are too coarse-grained
- Permissions allow fine-tuned access control
- Can create custom roles with specific permissions
- Financial applications require this level of control

**Consequences**:
- More complex authorization logic
- Need permission management UI
- Need to seed default permissions

---

## ADR-005: Financial-Grade Audit Logging
**Date**: January 19, 2026
**Status**: Accepted

**Context**: Enterprise applications need comprehensive audit trails.

**Decision**: Implement immutable audit logging with:
- EF Core SaveChanges interceptor for automatic entity tracking
- MediatR AuditBehavior for command/query logging
- Hash chain for tamper detection
- Full context capture (IP, user agent, session, correlation ID)

**Rationale**:
- Compliance requirements in enterprise
- Debugging and forensics capability
- Demonstrates enterprise-level thinking
- Differentiates portfolio from basic CRUD apps

**Consequences**:
- Additional database writes on every operation
- Need to manage audit log growth (retention policies)
- Worth it for enterprise credibility

---

# SPRINT 1: SOLUTION ARCHITECTURE & INFRASTRUCTURE

## Sprint Goal
Project foundation with CQRS, authentication, and base infrastructure

## Sprint Dates
**Start**: January 19, 2026
**End**: [In Progress]

---

### Day 1: January 19, 2026

#### What I Did
- [x] Created solution structure with 4 projects
- [x] Set up Clean Architecture with proper project references
- [x] Installed all NuGet packages
- [x] Created complete Domain layer (entities, enums, exceptions)
- [x] Fixed build errors in Domain project

#### Solution Structure Created
```
UniverSysLite.sln
├── src/
│   ├── Core/
│   │   ├── UniverSysLite.Domain/          (.NET 8 Class Library)
│   │   └── UniverSysLite.Application/     (.NET 8 Class Library)
│   ├── Infrastructure/
│   │   └── UniverSysLite.Infrastructure/  (.NET 8 Class Library)
│   └── Presentation/
│       └── UniverSysLite.API/             (ASP.NET Core 8 Web API)
```

#### Project References (Clean Architecture Flow)
```
API → Infrastructure → Application → Domain
```

#### Domain Layer Files Created
```
src/Core/UniverSysLite.Domain/
├── Common/
│   ├── BaseEntity.cs
│   ├── BaseAuditableEntity.cs
│   ├── IAggregateRoot.cs
│   ├── IDomainEvent.cs
│   └── ISoftDelete.cs
├── Entities/
│   └── Identity/
│       ├── ApplicationUser.cs
│       ├── ApplicationRole.cs
│       ├── ApplicationUserRole.cs
│       ├── Permission.cs
│       ├── RolePermission.cs
│       ├── UserProfile.cs
│       ├── UserSettings.cs
│       ├── UserSession.cs
│       ├── RefreshToken.cs
│       ├── PasswordHistory.cs
│       ├── Notification.cs
│       ├── UserNotificationPreference.cs
│       └── AuditLog.cs
├── Enums/
│   ├── ThemeMode.cs
│   ├── UiDensity.cs
│   ├── FontSize.cs
│   ├── DigestFrequency.cs
│   ├── ProfileVisibility.cs
│   ├── NotificationType.cs
│   ├── NotificationPriority.cs
│   ├── AuditAction.cs
│   └── AuditSeverity.cs
└── Exceptions/
    ├── DomainException.cs
    ├── NotFoundException.cs
    ├── ValidationException.cs
    ├── UnauthorizedException.cs
    ├── ForbiddenException.cs
    └── BusinessRuleException.cs
```

#### Packages Installed

**Domain Project:**
```bash
dotnet add package MediatR.Contracts --version 2.0.1
dotnet add package Microsoft.Extensions.Identity.Stores --version 8.0.*
```

**Application Project:**
```bash
dotnet add package MediatR
dotnet add package FluentValidation
dotnet add package FluentValidation.DependencyInjectionExtensions
dotnet add package Mapster
```

**Infrastructure Project:**
```bash
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.*
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.*
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore --version 8.0.*
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.*
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File
```

**API Project:**
```bash
dotnet add package Swashbuckle.AspNetCore
```

#### Issues Encountered

**Issue #001: EF Core 10.x Incompatible with .NET 8**
- **Error**: `Package Microsoft.EntityFrameworkCore.SqlServer 10.0.2 is not compatible with net8.0`
- **Cause**: NuGet was pulling EF Core 10.x which requires .NET 10
- **Resolution**: Specified version constraint `--version 8.0.*` for all EF Core packages

**Issue #002: Domain Project Missing Package References**
- **Error**: `The type or namespace name 'MediatR' could not be found` and `The type or namespace name 'AspNetCore' does not exist in the namespace 'Microsoft'`
- **Cause**: Domain project needed minimal dependencies for `INotification` (MediatR) and Identity base classes
- **Resolution**: Added `MediatR.Contracts` (lightweight contracts-only package) and `Microsoft.Extensions.Identity.Stores` (minimal Identity types)

#### Notes
- Domain project must stay lightweight - only contracts/interfaces, no implementation
- `MediatR.Contracts` is the correct package for Domain (not full `MediatR`)
- `Microsoft.Extensions.Identity.Stores` provides `IdentityUser`, `IdentityRole` without EF Core dependency
- All packages using version 8.0.* to match .NET 8 target framework

---

### Day 2: January 20, 2026

#### What I Did
- [x] Created Application layer folder structure
- [x] Created core interfaces:
  - `IApplicationDbContext` - Database abstraction
  - `ICurrentUserService` - Current user context
  - `ITokenService` - JWT token generation/validation
  - `IAuditService` - Audit logging
  - `IDateTimeService` - DateTime abstraction for testing
  - `IEmailService` - Email sending abstraction
- [x] Created common models:
  - `Result<T>` - Operation result wrapper
  - `PaginatedList<T>` - Paginated query results
  - `ApiResponse<T>` - Standard API response format
  - `PaginationParams` - Pagination request parameters
- [x] Created MediatR pipeline behaviors:
  - `ValidationBehavior` - FluentValidation integration
  - `LoggingBehavior` - Request/response logging
  - `PerformanceBehavior` - Long-running request warnings
  - `UnhandledExceptionBehavior` - Exception logging
  - `AuthorizationBehavior` - Permission checking
- [x] Created security attributes:
  - `AuthorizeAttribute` - Role and permission-based authorization
- [x] Created Identity CQRS:
  - `LoginCommand` + Handler + Validator
  - `RegisterCommand` + Handler + Validator
  - `RefreshTokenCommand` + Handler + Validator
  - `GetCurrentUserQuery` + Handler
- [x] Created Identity DTOs:
  - `UserDto`, `UserSummaryDto`
  - `AuthenticationResponse`
- [x] Created `DependencyInjection.cs` for Application services
- [x] Fixed package version conflicts (8.0.* wildcard)
- [x] All projects build successfully

#### Application Layer Files Created
```
src/Core/UniverSysLite.Application/
├── Common/
│   ├── Behaviors/
│   │   ├── ValidationBehavior.cs
│   │   ├── LoggingBehavior.cs
│   │   ├── PerformanceBehavior.cs
│   │   ├── UnhandledExceptionBehavior.cs
│   │   └── AuthorizationBehavior.cs
│   ├── Interfaces/
│   │   ├── IApplicationDbContext.cs
│   │   ├── ICurrentUserService.cs
│   │   ├── ITokenService.cs
│   │   ├── IAuditService.cs
│   │   ├── IDateTimeService.cs
│   │   └── IEmailService.cs
│   ├── Models/
│   │   ├── Result.cs
│   │   ├── PaginatedList.cs
│   │   └── ApiResponse.cs
│   └── Security/
│       └── AuthorizeAttribute.cs
├── Identity/
│   ├── Commands/
│   │   ├── Login/
│   │   │   ├── LoginCommand.cs
│   │   │   ├── LoginCommandHandler.cs
│   │   │   └── LoginCommandValidator.cs
│   │   ├── Register/
│   │   │   ├── RegisterCommand.cs
│   │   │   ├── RegisterCommandHandler.cs
│   │   │   └── RegisterCommandValidator.cs
│   │   └── RefreshToken/
│   │       ├── RefreshTokenCommand.cs
│   │       ├── RefreshTokenCommandHandler.cs
│   │       └── RefreshTokenCommandValidator.cs
│   ├── Queries/
│   │   └── GetCurrentUser/
│   │       ├── GetCurrentUserQuery.cs
│   │       └── GetCurrentUserQueryHandler.cs
│   └── DTOs/
│       ├── UserDto.cs
│       └── AuthenticationResponse.cs
└── DependencyInjection.cs
```

#### Notes
- Used MediatR 12.4.1 (latest compatible with .NET 8)
- FluentValidation 11.10.0 for request validation
- Package versions aligned with wildcard (8.0.*) to avoid conflicts
- Build has 3 minor warnings (nullable reference assignments) - acceptable

---

### Day 3: January 20, 2026

#### What I Did
- [x] Configured Program.cs with full service pipeline:
  - Serilog logging (console + file)
  - CORS for React frontend (http://localhost:5173)
  - Swagger/OpenAPI with JWT security definition
  - Health checks with EF Core DbContext check
  - Exception handling middleware
- [x] Created appsettings.json and appsettings.Development.json with:
  - SQL Server LocalDB connection strings
  - JWT settings (secret, issuer, audience, expiration)
  - Email settings (SMTP configuration)
  - CORS origins
  - Serilog configuration
- [x] Created ExceptionHandlingMiddleware for global exception handling
- [x] Created custom Application exceptions:
  - ValidationException, NotFoundException, ForbiddenAccessException, UnauthorizedException
- [x] Created BaseApiController with MediatR integration
- [x] Created AuthController with endpoints:
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/refresh-token
  - GET /api/auth/me (authenticated)
- [x] Created DatabaseSeeder with:
  - 32 permissions across 9 modules
  - 6 roles with assigned permissions
  - Admin user (admin@universyslite.edu / Admin@123!)
- [x] Created InitialCreate EF Core migration
- [x] Tested all endpoints successfully
- [x] Fixed BaseEntity.Id to use `init` accessor for proper seeding

#### API Layer Files Created
```
src/Presentation/UniverSysLite.API/
├── Controllers/
│   ├── BaseApiController.cs
│   └── AuthController.cs
├── Middleware/
│   └── ExceptionHandlingMiddleware.cs
├── Program.cs
├── appsettings.json
└── appsettings.Development.json

src/Core/UniverSysLite.Application/Common/Exceptions/
├── ValidationException.cs
├── NotFoundException.cs
├── ForbiddenAccessException.cs
└── UnauthorizedException.cs

src/Infrastructure/UniverSysLite.Infrastructure/Persistence/
├── DatabaseSeeder.cs
└── Migrations/
    └── 20260120095025_InitialCreate.cs
```

#### Issues Encountered

**Issue #003: Package Version Mismatch - Swashbuckle**
- **Error**: `The type or namespace name 'Models' does not exist in the namespace 'Microsoft.OpenApi'`
- **Cause**: Swashbuckle.AspNetCore 10.1.0 was installed but incompatible with .NET 8
- **Resolution**: Downgraded to `6.5.*` version

**Issue #004: AddDbContextCheck Missing**
- **Error**: `IHealthChecksBuilder does not contain a definition for 'AddDbContextCheck'`
- **Resolution**: Added `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore` package

**Issue #005: BaseEntity.Id Protected Setter**
- **Error**: `The property or indexer 'BaseEntity.Id' cannot be used in this context because the set accessor is inaccessible`
- **Cause**: BaseEntity.Id had `protected set` preventing external initialization
- **Resolution**: Changed to `init` accessor with default value: `public Guid Id { get; init; } = Guid.NewGuid();`

**Issue #006: RolePermission Has No Id**
- **Error**: `'RolePermission' does not contain a definition for 'Id'`
- **Cause**: RolePermission uses composite key (RoleId + PermissionId), not single Id
- **Resolution**: Removed Id assignment from RolePermission seeding

**Issue #007: Role "User" Does Not Exist**
- **Error**: `Role USER does not exist` during registration
- **Cause**: RegisterCommandHandler tried to assign "User" role but seeded role was "Student"
- **Resolution**: Changed default role assignment from "User" to "Student"

#### Migration Commands
```bash
# Add migration
dotnet ef migrations add InitialCreate -p src/Infrastructure/UniverSysLite.Infrastructure -s src/Presentation/UniverSysLite.API -o Persistence/Migrations

# Update database
dotnet ef database update -p src/Infrastructure/UniverSysLite.Infrastructure -s src/Presentation/UniverSysLite.API
```

#### Testing Results
All endpoints tested and working:
```bash
# Login (Admin)
POST /api/auth/login
{email: "admin@universyslite.edu", password: "Admin@123!"}
→ Returns JWT with all 32 permissions

# Register (New Student)
POST /api/auth/register
{email: "student@example.com", password: "Test@123!", ...}
→ Returns user ID, assigns Student role

# Health Check
GET /health → "Healthy"

# Swagger
GET /swagger → Swagger UI with JWT auth support
```

---

### Day 4: [Date]

#### What I Did
- [ ] Implemented JWT authentication
- [ ] Created Login command/handler
- [ ] Set up refresh tokens

#### Notes
- [Authentication configuration details]

---

### Day 5: [Date]

#### What I Did
- [ ] Set up React frontend
- [ ] Installed npm packages
- [ ] Created login page

#### Frontend Setup Commands
```bash
# Create Vite React project
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install @reduxjs/toolkit react-redux
npm install @tanstack/react-router @tanstack/router-devtools
npm install @tanstack/react-table
npm install @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install tailwindcss postcss autoprefixer
npm install lucide-react
npm install date-fns
npm install sonner
npm install axios

# Initialize Tailwind
npx tailwindcss init -p

# Install shadcn/ui
npx shadcn-ui@latest init
```

---

### Sprint 1 Retrospective

#### What Went Well
- [List positives]

#### What Could Be Improved
- [List improvements]

#### Action Items for Next Sprint
- [List action items]

---

# SPRINT 2: ENTERPRISE USER MANAGEMENT

## Sprint Goal
Complete user management with profiles, settings, and sessions

## Sprint Dates
**Start**: [TBD]
**End**: [TBD]

---

### Day 1: [Date]

#### What I Did
- [ ] Created User CRUD commands/queries
- [ ] Implemented UsersController

---

[Continue similar structure for each day...]

---

# SPRINT 3: ROLES, PERMISSIONS & AUDIT SYSTEM

## Sprint Goal
Granular permissions and financial-grade audit logging

## Sprint Dates
**Start**: [TBD]
**End**: [TBD]

---

[Continue structure...]

---

# SPRINT 4: STUDENT MANAGEMENT & NOTIFICATIONS

## Sprint Goal
Student CRUD and notification system

## Sprint Dates
**Start**: [TBD]
**End**: [TBD]

---

[Continue structure...]

---

# SPRINT 5: COURSES & REGISTRATION

## Sprint Goal
Course catalog and registration workflow

## Sprint Dates
**Start**: [TBD]
**End**: [TBD]

---

[Continue structure...]

---

# SPRINT 6: GRADING & BILLING

## Sprint Goal
Grade entry and billing system

## Sprint Dates
**Start**: [TBD]
**End**: [TBD]

---

[Continue structure...]

---

# SPRINT 7: TRANSCRIPTS, REPORTS & POLISH

## Sprint Goal
PDF generation, reports, and final polish

## Sprint Dates
**Start**: [TBD]
**End**: [TBD]

---

[Continue structure...]

---

# ISSUES & RESOLUTIONS

## Issue Log

| ID | Date | Sprint | Issue Description | Resolution | Time Spent |
|----|------|--------|-------------------|------------|------------|
| 001 | 2026-01-19 | Sprint 1 | EF Core 10.x not compatible with .NET 8 | Use `--version 8.0.*` for all EF Core packages | 5 min |
| 002 | 2026-01-19 | Sprint 1 | Domain project missing MediatR and Identity types | Added MediatR.Contracts and Microsoft.Extensions.Identity.Stores packages | 10 min |

---

## Common Issues Reference

### Issue: EF Core Migration Fails
**Symptoms**: Migration command throws error about connection string
**Resolution**:
```bash
# Ensure connection string is in appsettings.Development.json
# Or use --connection option
dotnet ef migrations add MigrationName --connection "Server=(localdb)\mssqllocaldb;Database=UniverSysLite;Trusted_Connection=True;"
```

---

### Issue: JWT Token Not Working
**Symptoms**: 401 Unauthorized on protected endpoints
**Checklist**:
1. Check token is being sent in Authorization header: `Bearer {token}`
2. Verify token hasn't expired
3. Check JWT configuration in appsettings.json matches token generation
4. Verify issuer and audience match

---

### Issue: CORS Errors in React
**Symptoms**: Blocked by CORS policy
**Resolution**:
```csharp
// In Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Then use: app.UseCors("AllowReact");
```

---

### Issue: MediatR Handler Not Found
**Symptoms**: Exception about no handler registered
**Resolution**:
```csharp
// Ensure assembly scanning in DependencyInjection.cs
services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
});
```

---

# LESSONS LEARNED

## Technical Lessons

### Lesson 1: [Title]
**Date**: [Date]
**Context**: [What were you doing]
**Learning**: [What you learned]
**Application**: [How to apply this going forward]

---

## Process Lessons

### Lesson 1: [Title]
**Date**: [Date]
**Learning**: [What you learned about process]

---

# USEFUL COMMANDS & SCRIPTS

## .NET Commands

```bash
# Build solution
dotnet build

# Run API
dotnet run --project src/Presentation/UniverSysLite.API

# Run with watch (hot reload)
dotnet watch run --project src/Presentation/UniverSysLite.API

# Run tests
dotnet test

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# EF Core Migrations
dotnet ef migrations add MigrationName -p src/Infrastructure/UniverSysLite.Infrastructure -s src/Presentation/UniverSysLite.API
dotnet ef database update -p src/Infrastructure/UniverSysLite.Infrastructure -s src/Presentation/UniverSysLite.API
dotnet ef migrations remove -p src/Infrastructure/UniverSysLite.Infrastructure -s src/Presentation/UniverSysLite.API

# Generate EF Core script
dotnet ef migrations script -p src/Infrastructure/UniverSysLite.Infrastructure -s src/Presentation/UniverSysLite.API -o migration.sql
```

## React/npm Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint
npm run lint

# Add shadcn component
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
```

## Git Commands

```bash
# Feature branch workflow
git checkout -b feature/sprint1-auth
git add .
git commit -m "feat: implement JWT authentication"
git push -u origin feature/sprint1-auth

# Conventional commits
# feat: new feature
# fix: bug fix
# docs: documentation
# refactor: code refactoring
# test: adding tests
# chore: maintenance
```

## SQL Server Commands

```sql
-- Check database exists
SELECT name FROM sys.databases WHERE name = 'UniverSysLite';

-- View all tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';

-- View audit logs
SELECT TOP 100 * FROM AuditLogs ORDER BY Timestamp DESC;

-- Check user permissions
SELECT u.UserName, r.Name as Role, p.Name as Permission
FROM AspNetUsers u
JOIN AspNetUserRoles ur ON u.Id = ur.UserId
JOIN AspNetRoles r ON ur.RoleId = r.Id
JOIN RolePermissions rp ON r.Id = rp.RoleId
JOIN Permissions p ON rp.PermissionId = p.Id
WHERE u.UserName = 'admin@university.edu';
```

---

# REFERENCE LINKS

## Documentation
- [ASP.NET Core 8 Docs](https://learn.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [MediatR Wiki](https://github.com/jbogard/MediatR/wiki)
- [FluentValidation Docs](https://docs.fluentvalidation.net/)
- [React Documentation](https://react.dev/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Table](https://tanstack.com/table)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## Architecture References
- [Clean Architecture by Jason Taylor](https://github.com/jasontaylordev/CleanArchitecture)
- [CQRS Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)

## Tutorials Used
- [List any tutorials you followed]

---

# APPENDIX

## Connection Strings

### Development (LocalDB)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=UniverSysLite;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

### Production (SQL Server)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-server;Database=UniverSysLite;User Id=your-user;Password=your-password;TrustServerCertificate=True;"
  }
}
```

## JWT Configuration

```json
{
  "JwtSettings": {
    "Secret": "your-256-bit-secret-key-here-make-it-long-enough",
    "Issuer": "UniverSysLite",
    "Audience": "UniverSysLite",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  }
}
```

## Default Admin Credentials (Development Only)

```
Email: admin@university.edu
Password: Admin@123456
Role: SuperAdmin
```

---

**Last Updated**: January 20, 2026 (End of Day 3 - Sprint 1 Complete!)
**Updated By**: Claude Opus 4.5
**Session Status**: Sprint 1 COMPLETE - Ready for Sprint 2 (Enterprise User Management)
