# UniverSys Lite - Enterprise Implementation Plan
## Professional Portfolio Project with Enterprise-Grade Architecture

---

# PROJECT OVERVIEW

**UniverSys Lite** is an enterprise-grade University Management System built with financial-application-level security, auditing, and user management. This project demonstrates mastery of enterprise patterns including CQRS, Clean Architecture, and comprehensive audit logging.

## What This Project Demonstrates

- **Clean Architecture** with Domain-Driven Design
- **CQRS Pattern** with MediatR for command/query separation
- **Full ASP.NET Core Controllers** with proper REST conventions
- **Enterprise User Management** (profiles, settings, themes, notifications)
- **Granular Permission System** (role + permission-based authorization)
- **Financial-Grade Audit Logging** (every action tracked and immutable)
- **Modern React Frontend** with industry-standard tooling
- Production-ready security and code quality

---

# TECHNICAL ARCHITECTURE

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        ENTERPRISE TECHNOLOGY STACK                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  FRONTEND (Modern React)                                                        │
│  ├── React 18 with TypeScript (Strict Mode)                                    │
│  ├── Vite 5 (Build tool - fast HMR)                                            │
│  ├── Redux Toolkit + RTK Query (State management & API)                        │
│  ├── TanStack Router v1 (Type-safe file-based routing)                         │
│  ├── TanStack Table v8 (Powerful data grids)                                   │
│  ├── TanStack Query v5 (Server state management)                               │
│  ├── React Hook Form + Zod (Forms & validation)                                │
│  ├── Tailwind CSS v3 + shadcn/ui (Styling & components)                        │
│  ├── Recharts + Tremor (Data visualization)                                    │
│  ├── React-PDF / @react-pdf/renderer (PDF generation)                          │
│  ├── date-fns (Date handling)                                                  │
│  ├── react-hot-toast / Sonner (Notifications)                                  │
│  ├── Lucide React (Icons)                                                      │
│  └── Vitest + React Testing Library + MSW (Testing)                            │
│                                                                                 │
│  BACKEND (ASP.NET Core 8 - Enterprise)                                         │
│  ├── ASP.NET Core 8 Web API (Full Controllers)                                 │
│  ├── CQRS Pattern with MediatR                                                 │
│  ├── Clean Architecture / Domain-Driven Design                                 │
│  ├── Entity Framework Core 8                                                   │
│  ├── ASP.NET Core Identity (Extended)                                          │
│  ├── JWT Authentication + Refresh Tokens                                       │
│  ├── FluentValidation (Request validation)                                     │
│  ├── Mapster (High-performance mapping)                                        │
│  ├── Serilog + Seq (Structured logging)                                        │
│  ├── MediatR Pipeline Behaviors (Validation, Logging, Transactions)            │
│  ├── Polly (Resilience & retry policies)                                       │
│  └── xUnit + FluentAssertions + Moq + Bogus (Testing)                          │
│                                                                                 │
│  DATABASE                                                                       │
│  ├── SQL Server 2022 (Primary database)                                        │
│  ├── SQL Server LocalDB (Development)                                          │
│  └── Entity Framework Core Migrations                                          │
│                                                                                 │
│  CROSS-CUTTING CONCERNS                                                         │
│  ├── Audit Logging (Financial-grade, immutable)                                │
│  ├── Exception Handling Middleware                                             │
│  ├── Request/Response Logging                                                  │
│  ├── Performance Monitoring                                                    │
│  ├── Health Checks                                                             │
│  └── API Versioning                                                            │
│                                                                                 │
│  DOCUMENTATION                                                                  │
│  ├── Swagger/OpenAPI 3.0 (API docs)                                            │
│  ├── Storybook (Component library)                                             │
│  └── Markdown docs (Architecture, guides)                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## CQRS Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CQRS FLOW                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌──────────┐     ┌──────────────────────────────────────────────────────┐    │
│   │ React UI │────▶│                    API Controller                     │    │
│   └──────────┘     └──────────────────────────────────────────────────────┘    │
│                                          │                                      │
│                    ┌─────────────────────┴─────────────────────┐               │
│                    ▼                                           ▼               │
│         ┌─────────────────────┐                    ┌─────────────────────┐     │
│         │      COMMANDS       │                    │       QUERIES       │     │
│         │   (Write Operations)│                    │  (Read Operations)  │     │
│         └─────────────────────┘                    └─────────────────────┘     │
│                    │                                           │               │
│                    ▼                                           ▼               │
│         ┌─────────────────────┐                    ┌─────────────────────┐     │
│         │  Command Handler    │                    │   Query Handler     │     │
│         │  (Business Logic)   │                    │  (Read Optimized)   │     │
│         └─────────────────────┘                    └─────────────────────┘     │
│                    │                                           │               │
│                    │      ┌─────────────────────┐              │               │
│                    │      │  MediatR Pipeline   │              │               │
│                    │      │  ├─ Validation      │              │               │
│                    │      │  ├─ Logging         │              │               │
│                    │      │  ├─ Transaction     │              │               │
│                    │      │  └─ Audit           │              │               │
│                    │      └─────────────────────┘              │               │
│                    │                                           │               │
│                    ▼                                           ▼               │
│         ┌─────────────────────────────────────────────────────────────┐        │
│         │                    Entity Framework Core                     │        │
│         │                      (SQL Server)                           │        │
│         └─────────────────────────────────────────────────────────────┘        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Solution Structure

```
UniverSysLite/
├── src/
│   ├── Core/
│   │   ├── UniverSysLite.Domain/
│   │   │   ├── Common/
│   │   │   │   ├── BaseEntity.cs
│   │   │   │   ├── BaseAuditableEntity.cs
│   │   │   │   ├── IAggregateRoot.cs
│   │   │   │   ├── IDomainEvent.cs
│   │   │   │   └── ValueObject.cs
│   │   │   ├── Entities/
│   │   │   │   ├── Identity/
│   │   │   │   │   ├── ApplicationUser.cs
│   │   │   │   │   ├── ApplicationRole.cs
│   │   │   │   │   ├── Permission.cs
│   │   │   │   │   ├── RolePermission.cs
│   │   │   │   │   ├── UserProfile.cs
│   │   │   │   │   ├── UserSettings.cs
│   │   │   │   │   ├── UserSession.cs
│   │   │   │   │   └── RefreshToken.cs
│   │   │   │   ├── Students/
│   │   │   │   │   ├── Student.cs
│   │   │   │   │   ├── EmergencyContact.cs
│   │   │   │   │   ├── StudentAddress.cs
│   │   │   │   │   └── Hold.cs
│   │   │   │   ├── Academic/
│   │   │   │   │   ├── Course.cs
│   │   │   │   │   ├── Section.cs
│   │   │   │   │   ├── SectionSchedule.cs
│   │   │   │   │   ├── Enrollment.cs
│   │   │   │   │   ├── Grade.cs
│   │   │   │   │   ├── Term.cs
│   │   │   │   │   ├── Department.cs
│   │   │   │   │   ├── Program.cs
│   │   │   │   │   └── Prerequisite.cs
│   │   │   │   ├── Billing/
│   │   │   │   │   ├── BillingAccount.cs
│   │   │   │   │   ├── Charge.cs
│   │   │   │   │   ├── Payment.cs
│   │   │   │   │   ├── PaymentPlan.cs
│   │   │   │   │   └── TuitionRate.cs
│   │   │   │   └── Notifications/
│   │   │   │       ├── Notification.cs
│   │   │   │       ├── NotificationTemplate.cs
│   │   │   │       └── UserNotificationPreference.cs
│   │   │   ├── Enums/
│   │   │   │   ├── StudentStatus.cs
│   │   │   │   ├── AcademicLevel.cs
│   │   │   │   ├── AcademicStanding.cs
│   │   │   │   ├── EnrollmentStatus.cs
│   │   │   │   ├── GradeStatus.cs
│   │   │   │   ├── ChargeType.cs
│   │   │   │   ├── PaymentMethod.cs
│   │   │   │   ├── NotificationType.cs
│   │   │   │   ├── NotificationChannel.cs
│   │   │   │   ├── AuditAction.cs
│   │   │   │   └── ThemeMode.cs
│   │   │   ├── ValueObjects/
│   │   │   │   ├── Address.cs
│   │   │   │   ├── Money.cs
│   │   │   │   ├── EmailAddress.cs
│   │   │   │   ├── PhoneNumber.cs
│   │   │   │   └── DateRange.cs
│   │   │   ├── Events/
│   │   │   │   ├── StudentCreatedEvent.cs
│   │   │   │   ├── EnrollmentCreatedEvent.cs
│   │   │   │   ├── GradeSubmittedEvent.cs
│   │   │   │   ├── PaymentReceivedEvent.cs
│   │   │   │   └── UserPasswordChangedEvent.cs
│   │   │   └── Exceptions/
│   │   │       ├── DomainException.cs
│   │   │       ├── NotFoundException.cs
│   │   │       ├── ValidationException.cs
│   │   │       ├── UnauthorizedException.cs
│   │   │       └── BusinessRuleException.cs
│   │   │
│   │   └── UniverSysLite.Application/
│   │       ├── Common/
│   │       │   ├── Interfaces/
│   │       │   │   ├── IApplicationDbContext.cs
│   │       │   │   ├── ICurrentUserService.cs
│   │       │   │   ├── IDateTimeService.cs
│   │       │   │   ├── IIdentityService.cs
│   │       │   │   ├── IAuditService.cs
│   │       │   │   ├── INotificationService.cs
│   │       │   │   ├── IEmailService.cs
│   │       │   │   └── IPdfService.cs
│   │       │   ├── Behaviors/
│   │       │   │   ├── ValidationBehavior.cs
│   │       │   │   ├── LoggingBehavior.cs
│   │       │   │   ├── TransactionBehavior.cs
│   │       │   │   ├── AuditBehavior.cs
│   │       │   │   ├── PerformanceBehavior.cs
│   │       │   │   └── AuthorizationBehavior.cs
│   │       │   ├── Models/
│   │       │   │   ├── Result.cs
│   │       │   │   ├── PaginatedList.cs
│   │       │   │   └── LookupDto.cs
│   │       │   ├── Mappings/
│   │       │   │   └── MappingConfig.cs
│   │       │   └── Security/
│   │       │       ├── IAuthorizeRequest.cs
│   │       │       └── RequirePermissionAttribute.cs
│   │       │
│   │       ├── Features/
│   │       │   ├── Auth/
│   │       │   │   ├── Commands/
│   │       │   │   │   ├── Login/
│   │       │   │   │   │   ├── LoginCommand.cs
│   │       │   │   │   │   ├── LoginCommandHandler.cs
│   │       │   │   │   │   └── LoginCommandValidator.cs
│   │       │   │   │   ├── RefreshToken/
│   │       │   │   │   ├── Logout/
│   │       │   │   │   ├── ForgotPassword/
│   │       │   │   │   ├── ResetPassword/
│   │       │   │   │   └── ChangePassword/
│   │       │   │   └── DTOs/
│   │       │   │       ├── AuthResponseDto.cs
│   │       │   │       └── TokenDto.cs
│   │       │   │
│   │       │   ├── Users/
│   │       │   │   ├── Commands/
│   │       │   │   │   ├── CreateUser/
│   │       │   │   │   ├── UpdateUser/
│   │       │   │   │   ├── DeleteUser/
│   │       │   │   │   ├── UpdateProfile/
│   │       │   │   │   ├── UpdateSettings/
│   │       │   │   │   ├── UploadAvatar/
│   │       │   │   │   ├── AssignRole/
│   │       │   │   │   └── UpdatePermissions/
│   │       │   │   ├── Queries/
│   │       │   │   │   ├── GetUsers/
│   │       │   │   │   ├── GetUserById/
│   │       │   │   │   ├── GetCurrentUser/
│   │       │   │   │   ├── GetUserProfile/
│   │       │   │   │   ├── GetUserSettings/
│   │       │   │   │   └── GetUserSessions/
│   │       │   │   └── DTOs/
│   │       │   │       ├── UserDto.cs
│   │       │   │       ├── UserDetailDto.cs
│   │       │   │       ├── UserProfileDto.cs
│   │       │   │       └── UserSettingsDto.cs
│   │       │   │
│   │       │   ├── Roles/
│   │       │   │   ├── Commands/
│   │       │   │   │   ├── CreateRole/
│   │       │   │   │   ├── UpdateRole/
│   │       │   │   │   ├── DeleteRole/
│   │       │   │   │   └── AssignPermissions/
│   │       │   │   ├── Queries/
│   │       │   │   │   ├── GetRoles/
│   │       │   │   │   ├── GetRoleById/
│   │       │   │   │   └── GetPermissions/
│   │       │   │   └── DTOs/
│   │       │   │
│   │       │   ├── Students/
│   │       │   │   ├── Commands/
│   │       │   │   │   ├── CreateStudent/
│   │       │   │   │   ├── UpdateStudent/
│   │       │   │   │   ├── DeleteStudent/
│   │       │   │   │   ├── AddHold/
│   │       │   │   │   └── ReleaseHold/
│   │       │   │   ├── Queries/
│   │       │   │   │   ├── GetStudents/
│   │       │   │   │   ├── GetStudentById/
│   │       │   │   │   ├── GetStudentDashboard/
│   │       │   │   │   ├── SearchStudents/
│   │       │   │   │   └── ExportStudents/
│   │       │   │   └── DTOs/
│   │       │   │
│   │       │   ├── Courses/
│   │       │   │   ├── Commands/
│   │       │   │   ├── Queries/
│   │       │   │   └── DTOs/
│   │       │   │
│   │       │   ├── Sections/
│   │       │   │   ├── Commands/
│   │       │   │   ├── Queries/
│   │       │   │   └── DTOs/
│   │       │   │
│   │       │   ├── Registration/
│   │       │   │   ├── Commands/
│   │       │   │   │   ├── AddToCart/
│   │       │   │   │   ├── RemoveFromCart/
│   │       │   │   │   ├── ProcessRegistration/
│   │       │   │   │   └── DropCourse/
│   │       │   │   ├── Queries/
│   │       │   │   │   ├── GetCart/
│   │       │   │   │   ├── GetSchedule/
│   │       │   │   │   └── ValidateRegistration/
│   │       │   │   └── DTOs/
│   │       │   │
│   │       │   ├── Grading/
│   │       │   │   ├── Commands/
│   │       │   │   │   ├── SubmitGrades/
│   │       │   │   │   ├── UpdateGrade/
│   │       │   │   │   └── RequestGradeChange/
│   │       │   │   ├── Queries/
│   │       │   │   │   ├── GetRoster/
│   │       │   │   │   ├── GetStudentGrades/
│   │       │   │   │   ├── CalculateGpa/
│   │       │   │   │   └── GetTranscript/
│   │       │   │   └── DTOs/
│   │       │   │
│   │       │   ├── Billing/
│   │       │   │   ├── Commands/
│   │       │   │   ├── Queries/
│   │       │   │   └── DTOs/
│   │       │   │
│   │       │   ├── Notifications/
│   │       │   │   ├── Commands/
│   │       │   │   │   ├── SendNotification/
│   │       │   │   │   ├── MarkAsRead/
│   │       │   │   │   └── UpdatePreferences/
│   │       │   │   ├── Queries/
│   │       │   │   │   ├── GetNotifications/
│   │       │   │   │   └── GetUnreadCount/
│   │       │   │   └── DTOs/
│   │       │   │
│   │       │   └── AuditLogs/
│   │       │       ├── Queries/
│   │       │       │   ├── GetAuditLogs/
│   │       │       │   ├── GetUserActivity/
│   │       │       │   └── GetEntityHistory/
│   │       │       └── DTOs/
│   │       │
│   │       └── DependencyInjection.cs
│   │
│   ├── Infrastructure/
│   │   └── UniverSysLite.Infrastructure/
│   │       ├── Persistence/
│   │       │   ├── ApplicationDbContext.cs
│   │       │   ├── ApplicationDbContextInitializer.cs
│   │       │   ├── Configurations/
│   │       │   │   ├── Identity/
│   │       │   │   │   ├── ApplicationUserConfiguration.cs
│   │       │   │   │   ├── ApplicationRoleConfiguration.cs
│   │       │   │   │   ├── PermissionConfiguration.cs
│   │       │   │   │   └── UserSettingsConfiguration.cs
│   │       │   │   ├── StudentConfiguration.cs
│   │       │   │   ├── CourseConfiguration.cs
│   │       │   │   ├── EnrollmentConfiguration.cs
│   │       │   │   ├── AuditLogConfiguration.cs
│   │       │   │   └── NotificationConfiguration.cs
│   │       │   ├── Migrations/
│   │       │   ├── Interceptors/
│   │       │   │   ├── AuditableEntityInterceptor.cs
│   │       │   │   └── SoftDeleteInterceptor.cs
│   │       │   └── Extensions/
│   │       │       └── QueryableExtensions.cs
│   │       │
│   │       ├── Identity/
│   │       │   ├── IdentityService.cs
│   │       │   ├── JwtService.cs
│   │       │   ├── PermissionService.cs
│   │       │   └── CurrentUserService.cs
│   │       │
│   │       ├── Services/
│   │       │   ├── DateTimeService.cs
│   │       │   ├── AuditService.cs
│   │       │   ├── NotificationService.cs
│   │       │   ├── EmailService.cs
│   │       │   └── PdfService.cs
│   │       │
│   │       └── DependencyInjection.cs
│   │
│   ├── Presentation/
│   │   └── UniverSysLite.API/
│   │       ├── Controllers/
│   │       │   ├── BaseApiController.cs
│   │       │   ├── AuthController.cs
│   │       │   ├── UsersController.cs
│   │       │   ├── RolesController.cs
│   │       │   ├── PermissionsController.cs
│   │       │   ├── StudentsController.cs
│   │       │   ├── CoursesController.cs
│   │       │   ├── SectionsController.cs
│   │       │   ├── RegistrationController.cs
│   │       │   ├── GradesController.cs
│   │       │   ├── TranscriptsController.cs
│   │       │   ├── BillingController.cs
│   │       │   ├── NotificationsController.cs
│   │       │   ├── AuditLogsController.cs
│   │       │   └── LookupsController.cs
│   │       │
│   │       ├── Middleware/
│   │       │   ├── ExceptionHandlingMiddleware.cs
│   │       │   ├── RequestLoggingMiddleware.cs
│   │       │   └── PerformanceMiddleware.cs
│   │       │
│   │       ├── Filters/
│   │       │   ├── ApiExceptionFilterAttribute.cs
│   │       │   └── ValidationFilterAttribute.cs
│   │       │
│   │       ├── Extensions/
│   │       │   ├── ServiceCollectionExtensions.cs
│   │       │   └── ApplicationBuilderExtensions.cs
│   │       │
│   │       ├── appsettings.json
│   │       ├── appsettings.Development.json
│   │       └── Program.cs
│   │
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── store.ts
│       │   │   ├── rootReducer.ts
│       │   │   ├── api/
│       │   │   │   ├── baseApi.ts
│       │   │   │   ├── authApi.ts
│       │   │   │   ├── usersApi.ts
│       │   │   │   ├── studentsApi.ts
│       │   │   │   ├── coursesApi.ts
│       │   │   │   ├── registrationApi.ts
│       │   │   │   ├── gradesApi.ts
│       │   │   │   ├── billingApi.ts
│       │   │   │   └── notificationsApi.ts
│       │   │   └── router.tsx
│       │   │
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   │   ├── authSlice.ts
│       │   │   │   ├── components/
│       │   │   │   │   ├── LoginForm.tsx
│       │   │   │   │   ├── ForgotPasswordForm.tsx
│       │   │   │   │   └── ResetPasswordForm.tsx
│       │   │   │   └── pages/
│       │   │   │       ├── LoginPage.tsx
│       │   │   │       └── ResetPasswordPage.tsx
│       │   │   │
│       │   │   ├── users/
│       │   │   │   ├── components/
│       │   │   │   │   ├── UserList.tsx
│       │   │   │   │   ├── UserForm.tsx
│       │   │   │   │   ├── UserProfile.tsx
│       │   │   │   │   ├── UserSettings.tsx
│       │   │   │   │   ├── ThemeSelector.tsx
│       │   │   │   │   ├── PasswordChange.tsx
│       │   │   │   │   └── NotificationPreferences.tsx
│       │   │   │   └── pages/
│       │   │   │       ├── UsersPage.tsx
│       │   │   │       ├── ProfilePage.tsx
│       │   │   │       └── SettingsPage.tsx
│       │   │   │
│       │   │   ├── roles/
│       │   │   │   ├── components/
│       │   │   │   │   ├── RoleList.tsx
│       │   │   │   │   ├── RoleForm.tsx
│       │   │   │   │   └── PermissionMatrix.tsx
│       │   │   │   └── pages/
│       │   │   │       └── RolesPage.tsx
│       │   │   │
│       │   │   ├── students/
│       │   │   ├── courses/
│       │   │   ├── registration/
│       │   │   ├── grading/
│       │   │   ├── billing/
│       │   │   │
│       │   │   ├── notifications/
│       │   │   │   ├── notificationsSlice.ts
│       │   │   │   ├── components/
│       │   │   │   │   ├── NotificationBell.tsx
│       │   │   │   │   ├── NotificationList.tsx
│       │   │   │   │   └── NotificationItem.tsx
│       │   │   │   └── pages/
│       │   │   │       └── NotificationsPage.tsx
│       │   │   │
│       │   │   ├── audit/
│       │   │   │   ├── components/
│       │   │   │   │   ├── AuditLogList.tsx
│       │   │   │   │   ├── AuditLogFilters.tsx
│       │   │   │   │   └── EntityHistory.tsx
│       │   │   │   └── pages/
│       │   │   │       └── AuditLogsPage.tsx
│       │   │   │
│       │   │   └── dashboard/
│       │   │       ├── components/
│       │   │       │   ├── StatCard.tsx
│       │   │       │   ├── RecentActivity.tsx
│       │   │       │   ├── EnrollmentChart.tsx
│       │   │       │   └── QuickActions.tsx
│       │   │       └── pages/
│       │   │           ├── AdminDashboard.tsx
│       │   │           ├── StudentDashboard.tsx
│       │   │           └── FacultyDashboard.tsx
│       │   │
│       │   ├── components/
│       │   │   ├── ui/                    # shadcn/ui components
│       │   │   ├── layout/
│       │   │   │   ├── Header.tsx
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   ├── MainLayout.tsx
│       │   │   │   ├── ThemeProvider.tsx
│       │   │   │   └── Breadcrumbs.tsx
│       │   │   └── common/
│       │   │       ├── DataTable/
│       │   │       │   ├── DataTable.tsx
│       │   │       │   ├── DataTablePagination.tsx
│       │   │       │   ├── DataTableColumnHeader.tsx
│       │   │       │   └── DataTableToolbar.tsx
│       │   │       ├── LoadingSpinner.tsx
│       │   │       ├── ErrorBoundary.tsx
│       │   │       ├── ConfirmDialog.tsx
│       │   │       ├── EmptyState.tsx
│       │   │       └── PermissionGate.tsx
│       │   │
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── usePermissions.ts
│       │   │   ├── useTheme.ts
│       │   │   ├── useNotifications.ts
│       │   │   ├── useDebounce.ts
│       │   │   └── useLocalStorage.ts
│       │   │
│       │   ├── lib/
│       │   │   ├── utils.ts
│       │   │   ├── permissions.ts
│       │   │   └── validators.ts
│       │   │
│       │   ├── types/
│       │   │   ├── auth.ts
│       │   │   ├── user.ts
│       │   │   ├── student.ts
│       │   │   ├── course.ts
│       │   │   ├── notification.ts
│       │   │   └── audit.ts
│       │   │
│       │   ├── styles/
│       │   │   └── globals.css
│       │   │
│       │   ├── App.tsx
│       │   └── main.tsx
│       │
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── package.json
│
├── tests/
│   ├── UniverSysLite.Domain.Tests/
│   ├── UniverSysLite.Application.Tests/
│   ├── UniverSysLite.Infrastructure.Tests/
│   ├── UniverSysLite.API.Tests/
│   └── UniverSysLite.E2E.Tests/
│
├── docs/
│   ├── project-management/
│   ├── architecture/
│   ├── user-guides/
│   ├── technical/
│   └── training/
│
├── scripts/
│   ├── seed-data.sql
│   ├── setup-dev.ps1
│   └── setup-dev.sh
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── Dockerfile
│
├── README.md
└── UniverSysLite.sln
```

---

# MODULE 1: ENTERPRISE USER MANAGEMENT (Enhanced)

## Overview
A financial-grade user management system with complete profile management, settings, themes, notifications, and comprehensive audit logging.

## Features

```
Enterprise User Management
├── Authentication
│   ├── Login with email/password
│   ├── JWT tokens (Access + Refresh)
│   ├── Refresh token rotation
│   ├── Token blacklisting on logout
│   ├── Multi-device session management
│   ├── Session activity tracking
│   ├── Force logout from all devices
│   └── Remember me functionality
│
├── Password Management
│   ├── Secure password hashing (Argon2/PBKDF2)
│   ├── Password strength validation
│   ├── Password history (prevent reuse of last 5)
│   ├── Password expiration policy
│   ├── Forgot password flow (email token)
│   ├── Change password (requires current)
│   ├── Force password reset by admin
│   └── Account lockout after failed attempts
│
├── User Profile
│   ├── Personal information
│   │   ├── First name, Last name
│   │   ├── Display name / Nickname
│   │   ├── Phone number
│   │   ├── Date of birth
│   │   └── Bio / About me
│   ├── Avatar/Photo upload
│   │   ├── Image cropping
│   │   ├── Multiple sizes (thumbnail, medium, large)
│   │   └── Default avatar generation
│   ├── Contact preferences
│   └── Profile visibility settings
│
├── User Settings
│   ├── Theme Preferences
│   │   ├── Light mode
│   │   ├── Dark mode
│   │   ├── System preference (auto)
│   │   ├── Custom accent color
│   │   └── Compact/Comfortable density
│   ├── Language & Regional
│   │   ├── Language selection
│   │   ├── Date format preference
│   │   ├── Time format (12h/24h)
│   │   ├── Timezone
│   │   └── Number format
│   ├── Accessibility
│   │   ├── High contrast mode
│   │   ├── Reduced motion
│   │   └── Font size adjustment
│   └── Privacy Settings
│       ├── Profile visibility
│       ├── Activity status
│       └── Data export request
│
├── Role Management
│   ├── Pre-defined roles
│   │   ├── SuperAdmin (full access)
│   │   ├── Admin (manage users, settings)
│   │   ├── Staff (registrar, bursar, advisor)
│   │   ├── Faculty (grade entry, rosters)
│   │   └── Student (self-service)
│   ├── Custom role creation
│   ├── Role hierarchy
│   ├── Role assignment to users
│   └── Multiple roles per user
│
├── Permission Management
│   ├── Granular permissions
│   │   ├── Module-level (Students, Courses, etc.)
│   │   ├── Action-level (Create, Read, Update, Delete)
│   │   ├── Field-level (sensitive data)
│   │   └── Data-level (own data vs all data)
│   ├── Permission groups
│   ├── Permission inheritance from roles
│   ├── Direct permission assignment
│   └── Permission matrix UI
│
├── Notification System
│   ├── Notification Types
│   │   ├── System alerts
│   │   ├── User mentions
│   │   ├── Task assignments
│   │   ├── Deadline reminders
│   │   ├── Approval requests
│   │   └── Security alerts
│   ├── Delivery Channels
│   │   ├── In-app notifications (bell icon)
│   │   ├── Email notifications
│   │   ├── Browser push notifications
│   │   └── SMS (future)
│   ├── Notification Preferences
│   │   ├── Per-type enable/disable
│   │   ├── Per-channel preferences
│   │   ├── Quiet hours
│   │   └── Digest frequency (immediate, daily, weekly)
│   ├── Notification Management
│   │   ├── Mark as read/unread
│   │   ├── Archive notifications
│   │   ├── Bulk actions
│   │   └── Notification history
│   └── Real-time delivery (SignalR future)
│
└── Admin Functions
    ├── User directory with search/filter
    ├── Create/edit/disable users
    ├── Bulk user import (CSV)
    ├── User impersonation (audit logged)
    ├── Force password reset
    ├── Unlock locked accounts
    ├── View user sessions
    ├── Terminate user sessions
    └── User activity reports
```

## Domain Models

```csharp
// ApplicationUser.cs - Extended Identity User
public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string? DisplayName { get; private set; }
    public string FullName => $"{FirstName} {LastName}";

    public bool IsActive { get; private set; } = true;
    public bool MustChangePassword { get; private set; } = false;
    public DateTime? PasswordChangedAt { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public string? LastLoginIp { get; private set; }
    public int FailedLoginAttempts { get; private set; } = 0;
    public DateTime? LockoutEndAt { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public Guid? CreatedById { get; private set; }
    public DateTime? ModifiedAt { get; private set; }
    public Guid? ModifiedById { get; private set; }

    // Navigation properties
    public UserProfile Profile { get; private set; }
    public UserSettings Settings { get; private set; }
    public ICollection<UserSession> Sessions { get; private set; }
    public ICollection<RefreshToken> RefreshTokens { get; private set; }
    public ICollection<Notification> Notifications { get; private set; }
    public ICollection<PasswordHistory> PasswordHistories { get; private set; }
    public ICollection<ApplicationUserRole> UserRoles { get; private set; }
}

// UserProfile.cs
public class UserProfile : BaseAuditableEntity
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public ApplicationUser User { get; private set; }

    public string? AvatarUrl { get; private set; }
    public string? AvatarThumbnailUrl { get; private set; }
    public string? PhoneNumber { get; private set; }
    public DateOnly? DateOfBirth { get; private set; }
    public string? Bio { get; private set; }
    public string? JobTitle { get; private set; }
    public string? Department { get; private set; }
    public string? Location { get; private set; }

    public ProfileVisibility Visibility { get; private set; } = ProfileVisibility.Internal;
}

// UserSettings.cs
public class UserSettings : BaseAuditableEntity
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public ApplicationUser User { get; private set; }

    // Theme
    public ThemeMode Theme { get; private set; } = ThemeMode.System;
    public string? AccentColor { get; private set; }
    public UiDensity Density { get; private set; } = UiDensity.Comfortable;

    // Regional
    public string Language { get; private set; } = "en-US";
    public string DateFormat { get; private set; } = "MM/dd/yyyy";
    public string TimeFormat { get; private set; } = "h:mm tt";
    public string Timezone { get; private set; } = "UTC";

    // Accessibility
    public bool HighContrastMode { get; private set; } = false;
    public bool ReducedMotion { get; private set; } = false;
    public FontSize FontSize { get; private set; } = FontSize.Medium;

    // Notifications
    public bool EmailNotifications { get; private set; } = true;
    public bool PushNotifications { get; private set; } = true;
    public bool InAppNotifications { get; private set; } = true;
    public DigestFrequency DigestFrequency { get; private set; } = DigestFrequency.Immediate;
    public TimeOnly? QuietHoursStart { get; private set; }
    public TimeOnly? QuietHoursEnd { get; private set; }
}

// Permission.cs
public class Permission : BaseEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }           // "Students.Create"
    public string DisplayName { get; private set; }    // "Create Students"
    public string? Description { get; private set; }
    public string Module { get; private set; }         // "Students"
    public string Action { get; private set; }         // "Create"
    public bool IsSystem { get; private set; }         // Cannot be deleted

    public ICollection<RolePermission> RolePermissions { get; private set; }
}

// UserNotificationPreference.cs
public class UserNotificationPreference : BaseAuditableEntity
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public ApplicationUser User { get; private set; }

    public NotificationType NotificationType { get; private set; }
    public bool EmailEnabled { get; private set; } = true;
    public bool PushEnabled { get; private set; } = true;
    public bool InAppEnabled { get; private set; } = true;
}

// Notification.cs
public class Notification : BaseAuditableEntity
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public ApplicationUser User { get; private set; }

    public NotificationType Type { get; private set; }
    public string Title { get; private set; }
    public string Message { get; private set; }
    public string? ActionUrl { get; private set; }
    public string? ActionText { get; private set; }
    public string? Icon { get; private set; }

    public bool IsRead { get; private set; } = false;
    public DateTime? ReadAt { get; private set; }
    public bool IsArchived { get; private set; } = false;
    public DateTime? ArchivedAt { get; private set; }

    public DateTime? ExpiresAt { get; private set; }
    public NotificationPriority Priority { get; private set; } = NotificationPriority.Normal;

    // Reference to source entity
    public string? EntityType { get; private set; }
    public Guid? EntityId { get; private set; }
}

// UserSession.cs
public class UserSession : BaseEntity
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public ApplicationUser User { get; private set; }

    public string DeviceInfo { get; private set; }
    public string Browser { get; private set; }
    public string OperatingSystem { get; private set; }
    public string IpAddress { get; private set; }
    public string? Location { get; private set; }

    public DateTime LoginAt { get; private set; }
    public DateTime LastActivityAt { get; private set; }
    public DateTime? LogoutAt { get; private set; }
    public bool IsActive { get; private set; } = true;
    public bool IsCurrent { get; private set; }
}
```

## API Endpoints (Full Controllers)

### AuthController
```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : BaseApiController
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginCommand command);

    [HttpPost("refresh-token")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenDto>> RefreshToken(RefreshTokenCommand command);

    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult> Logout();

    [HttpPost("logout-all")]
    [Authorize]
    public async Task<ActionResult> LogoutAllDevices();

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<ActionResult> ForgotPassword(ForgotPasswordCommand command);

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<ActionResult> ResetPassword(ResetPasswordCommand command);

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword(ChangePasswordCommand command);
}
```

### UsersController
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : BaseApiController
{
    [HttpGet]
    [RequirePermission("Users.Read")]
    public async Task<ActionResult<PaginatedList<UserDto>>> GetUsers([FromQuery] GetUsersQuery query);

    [HttpGet("{id:guid}")]
    [RequirePermission("Users.Read")]
    public async Task<ActionResult<UserDetailDto>> GetUser(Guid id);

    [HttpPost]
    [RequirePermission("Users.Create")]
    public async Task<ActionResult<Guid>> CreateUser(CreateUserCommand command);

    [HttpPut("{id:guid}")]
    [RequirePermission("Users.Update")]
    public async Task<ActionResult> UpdateUser(Guid id, UpdateUserCommand command);

    [HttpDelete("{id:guid}")]
    [RequirePermission("Users.Delete")]
    public async Task<ActionResult> DeleteUser(Guid id);

    [HttpGet("me")]
    public async Task<ActionResult<UserDetailDto>> GetCurrentUser();

    [HttpGet("me/profile")]
    public async Task<ActionResult<UserProfileDto>> GetMyProfile();

    [HttpPut("me/profile")]
    public async Task<ActionResult> UpdateMyProfile(UpdateProfileCommand command);

    [HttpPost("me/avatar")]
    public async Task<ActionResult<string>> UploadAvatar(IFormFile file);

    [HttpDelete("me/avatar")]
    public async Task<ActionResult> DeleteAvatar();

    [HttpGet("me/settings")]
    public async Task<ActionResult<UserSettingsDto>> GetMySettings();

    [HttpPut("me/settings")]
    public async Task<ActionResult> UpdateMySettings(UpdateSettingsCommand command);

    [HttpGet("me/sessions")]
    public async Task<ActionResult<List<UserSessionDto>>> GetMySessions();

    [HttpDelete("me/sessions/{sessionId:guid}")]
    public async Task<ActionResult> TerminateSession(Guid sessionId);

    [HttpPost("{id:guid}/assign-roles")]
    [RequirePermission("Users.AssignRoles")]
    public async Task<ActionResult> AssignRoles(Guid id, AssignRolesCommand command);

    [HttpPost("{id:guid}/force-password-reset")]
    [RequirePermission("Users.ForcePasswordReset")]
    public async Task<ActionResult> ForcePasswordReset(Guid id);

    [HttpPost("{id:guid}/unlock")]
    [RequirePermission("Users.Unlock")]
    public async Task<ActionResult> UnlockUser(Guid id);

    [HttpPost("{id:guid}/impersonate")]
    [RequirePermission("Users.Impersonate")]
    public async Task<ActionResult<AuthResponseDto>> ImpersonateUser(Guid id);
}
```

### RolesController & PermissionsController
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
[RequirePermission("Roles.Read")]
public class RolesController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<RoleDto>>> GetRoles();

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RoleDetailDto>> GetRole(Guid id);

    [HttpPost]
    [RequirePermission("Roles.Create")]
    public async Task<ActionResult<Guid>> CreateRole(CreateRoleCommand command);

    [HttpPut("{id:guid}")]
    [RequirePermission("Roles.Update")]
    public async Task<ActionResult> UpdateRole(Guid id, UpdateRoleCommand command);

    [HttpDelete("{id:guid}")]
    [RequirePermission("Roles.Delete")]
    public async Task<ActionResult> DeleteRole(Guid id);

    [HttpPut("{id:guid}/permissions")]
    [RequirePermission("Roles.AssignPermissions")]
    public async Task<ActionResult> AssignPermissions(Guid id, AssignPermissionsCommand command);
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
[RequirePermission("Permissions.Read")]
public class PermissionsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<PermissionDto>>> GetPermissions();

    [HttpGet("grouped")]
    public async Task<ActionResult<List<PermissionGroupDto>>> GetPermissionsGrouped();
}
```

### NotificationsController
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<NotificationDto>>> GetNotifications(
        [FromQuery] GetNotificationsQuery query);

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount();

    [HttpPut("{id:guid}/read")]
    public async Task<ActionResult> MarkAsRead(Guid id);

    [HttpPut("read-all")]
    public async Task<ActionResult> MarkAllAsRead();

    [HttpPut("{id:guid}/archive")]
    public async Task<ActionResult> Archive(Guid id);

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id);

    [HttpGet("preferences")]
    public async Task<ActionResult<List<NotificationPreferenceDto>>> GetPreferences();

    [HttpPut("preferences")]
    public async Task<ActionResult> UpdatePreferences(UpdateNotificationPreferencesCommand command);
}
```

---

# MODULE 2: FINANCIAL-GRADE AUDIT LOGGING SYSTEM

## Overview
Every action in the system is logged with immutable audit trails, similar to financial applications. This enables full accountability, compliance, and forensic analysis.

## Features

```
Audit Logging System
├── What Gets Logged
│   ├── Authentication Events
│   │   ├── Login success/failure
│   │   ├── Logout
│   │   ├── Password changes
│   │   ├── Password reset requests
│   │   ├── Account lockouts
│   │   └── Token refresh
│   │
│   ├── Data Changes (CRUD)
│   │   ├── Entity created
│   │   ├── Entity updated (with before/after values)
│   │   ├── Entity deleted (soft/hard)
│   │   └── Bulk operations
│   │
│   ├── Security Events
│   │   ├── Role assignments
│   │   ├── Permission changes
│   │   ├── User impersonation
│   │   ├── Access denied attempts
│   │   └── Suspicious activity
│   │
│   ├── Business Events
│   │   ├── Student registration
│   │   ├── Grade submission
│   │   ├── Payment processing
│   │   ├── Transcript generation
│   │   └── Hold placed/released
│   │
│   └── System Events
│       ├── Application startup/shutdown
│       ├── Configuration changes
│       ├── Scheduled job execution
│       └── Integration events
│
├── Audit Log Structure
│   ├── Timestamp (UTC, high precision)
│   ├── User ID (who performed action)
│   ├── User name & email
│   ├── Action type (Create, Update, Delete, etc.)
│   ├── Entity type (Student, Course, etc.)
│   ├── Entity ID
│   ├── Old values (JSON, for updates)
│   ├── New values (JSON)
│   ├── Changes summary
│   ├── IP address
│   ├── User agent
│   ├── Session ID
│   ├── Correlation ID (trace across operations)
│   ├── Duration (ms)
│   └── Additional context (JSON)
│
├── Audit Log Features
│   ├── Immutable records (no updates/deletes)
│   ├── Tamper detection (hash chain)
│   ├── Full-text search
│   ├── Advanced filtering
│   ├── Date range queries
│   ├── Export to CSV/Excel
│   └── Retention policies
│
└── Audit Views
    ├── Activity stream (timeline)
    ├── User activity report
    ├── Entity history (all changes to an entity)
    ├── Security audit report
    └── Compliance reports
```

## Domain Model

```csharp
// AuditLog.cs
public class AuditLog
{
    public long Id { get; private set; }                    // Auto-increment for ordering
    public Guid AuditId { get; private set; }               // Unique GUID

    // Who
    public Guid? UserId { get; private set; }
    public string? UserName { get; private set; }
    public string? UserEmail { get; private set; }
    public Guid? ImpersonatedById { get; private set; }     // If impersonating

    // What
    public AuditAction Action { get; private set; }
    public string EntityType { get; private set; }
    public string? EntityId { get; private set; }
    public string? EntityName { get; private set; }         // Human-readable identifier

    // Changes
    public string? OldValues { get; private set; }          // JSON
    public string? NewValues { get; private set; }          // JSON
    public string? ChangedColumns { get; private set; }     // Comma-separated
    public string? ChangesSummary { get; private set; }     // Human-readable

    // Context
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public Guid? SessionId { get; private set; }
    public string? CorrelationId { get; private set; }
    public string? RequestPath { get; private set; }
    public string? RequestMethod { get; private set; }

    // Timing
    public DateTime Timestamp { get; private set; }
    public long? DurationMs { get; private set; }

    // Additional
    public string? AdditionalData { get; private set; }     // JSON for extra context
    public AuditSeverity Severity { get; private set; }
    public string? ErrorMessage { get; private set; }

    // Integrity
    public string? PreviousHash { get; private set; }       // Hash of previous record
    public string Hash { get; private set; }                // Hash of this record
}

public enum AuditAction
{
    // Auth
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

    // Business
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
    SettingsChanged
}

public enum AuditSeverity
{
    Info,
    Warning,
    Security,
    Critical
}
```

## MediatR Pipeline Behavior for Auditing

```csharp
public class AuditBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IAuditService _auditService;
    private readonly ICurrentUserService _currentUserService;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();
            stopwatch.Stop();

            // Log successful operation
            if (request is IAuditableRequest auditableRequest)
            {
                await _auditService.LogAsync(new AuditEntry
                {
                    Action = auditableRequest.AuditAction,
                    EntityType = auditableRequest.EntityType,
                    EntityId = auditableRequest.EntityId,
                    NewValues = auditableRequest.GetAuditData(),
                    DurationMs = stopwatch.ElapsedMilliseconds
                });
            }

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            // Log failed operation
            await _auditService.LogErrorAsync(new AuditEntry
            {
                Action = AuditAction.Error,
                ErrorMessage = ex.Message,
                DurationMs = stopwatch.ElapsedMilliseconds,
                Severity = AuditSeverity.Warning
            });

            throw;
        }
    }
}
```

## API Endpoints

```csharp
[ApiController]
[Route("api/audit-logs")]
[Authorize]
[RequirePermission("AuditLogs.Read")]
public class AuditLogsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<AuditLogDto>>> GetAuditLogs(
        [FromQuery] GetAuditLogsQuery query);

    [HttpGet("{id:long}")]
    public async Task<ActionResult<AuditLogDetailDto>> GetAuditLog(long id);

    [HttpGet("entity/{entityType}/{entityId}")]
    public async Task<ActionResult<List<AuditLogDto>>> GetEntityHistory(
        string entityType, string entityId);

    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<PaginatedList<AuditLogDto>>> GetUserActivity(
        Guid userId, [FromQuery] GetUserActivityQuery query);

    [HttpGet("export")]
    [RequirePermission("AuditLogs.Export")]
    public async Task<FileResult> ExportAuditLogs([FromQuery] ExportAuditLogsQuery query);

    [HttpGet("statistics")]
    public async Task<ActionResult<AuditStatisticsDto>> GetStatistics(
        [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate);
}
```

---

# DEFINED PERMISSIONS

## Permission Structure

```
Permissions (Module.Action format)
├── Users
│   ├── Users.Read              - View user list and details
│   ├── Users.Create            - Create new users
│   ├── Users.Update            - Update user information
│   ├── Users.Delete            - Delete/disable users
│   ├── Users.AssignRoles       - Assign roles to users
│   ├── Users.ForcePasswordReset- Force password reset
│   ├── Users.Unlock            - Unlock locked accounts
│   ├── Users.Impersonate       - Impersonate other users
│   └── Users.ViewSessions      - View user sessions
│
├── Roles
│   ├── Roles.Read              - View roles
│   ├── Roles.Create            - Create roles
│   ├── Roles.Update            - Update roles
│   ├── Roles.Delete            - Delete roles
│   └── Roles.AssignPermissions - Assign permissions to roles
│
├── Permissions
│   └── Permissions.Read        - View all permissions
│
├── Students
│   ├── Students.Read           - View student list
│   ├── Students.ReadOwn        - View own student record
│   ├── Students.Create         - Create students
│   ├── Students.Update         - Update students
│   ├── Students.Delete         - Delete students
│   ├── Students.ManageHolds    - Add/remove holds
│   └── Students.Export         - Export student data
│
├── Courses
│   ├── Courses.Read            - View course catalog
│   ├── Courses.Create          - Create courses
│   ├── Courses.Update          - Update courses
│   └── Courses.Delete          - Delete courses
│
├── Sections
│   ├── Sections.Read           - View sections
│   ├── Sections.Create         - Create sections
│   ├── Sections.Update         - Update sections
│   ├── Sections.Delete         - Delete sections
│   └── Sections.ViewRoster     - View section roster
│
├── Registration
│   ├── Registration.Self       - Register self for courses
│   ├── Registration.Others     - Register other students
│   ├── Registration.Override   - Override restrictions
│   └── Registration.Manage     - Manage registration periods
│
├── Grades
│   ├── Grades.Read             - View all grades
│   ├── Grades.ReadOwn          - View own grades
│   ├── Grades.Submit           - Submit grades (faculty)
│   ├── Grades.Update           - Update grades
│   └── Grades.ChangeRequest    - Process grade changes
│
├── Billing
│   ├── Billing.Read            - View billing accounts
│   ├── Billing.ReadOwn         - View own billing
│   ├── Billing.AddCharge       - Add charges
│   ├── Billing.ProcessPayment  - Process payments
│   └── Billing.Manage          - Full billing management
│
├── Transcripts
│   ├── Transcripts.ReadOwn     - View/print own transcript
│   ├── Transcripts.ReadAll     - View any transcript
│   └── Transcripts.Official    - Generate official transcripts
│
├── Notifications
│   ├── Notifications.Send      - Send notifications
│   └── Notifications.Manage    - Manage notification templates
│
├── AuditLogs
│   ├── AuditLogs.Read          - View audit logs
│   └── AuditLogs.Export        - Export audit logs
│
└── Settings
    ├── Settings.Read           - View system settings
    └── Settings.Update         - Update system settings
```

## Default Role Permissions

```
SuperAdmin: All permissions

Admin:
  - Users.* (all)
  - Roles.* (all)
  - Permissions.Read
  - Students.* (all)
  - Courses.* (all)
  - Sections.* (all)
  - Registration.* (all)
  - Grades.* (all)
  - Billing.* (all)
  - Transcripts.* (all)
  - Notifications.* (all)
  - AuditLogs.* (all)
  - Settings.* (all)

Staff (Registrar):
  - Users.Read
  - Students.* (all)
  - Courses.Read
  - Sections.* (all)
  - Registration.Others, Registration.Override, Registration.Manage
  - Grades.Read, Grades.ChangeRequest
  - Billing.Read
  - Transcripts.ReadAll, Transcripts.Official
  - AuditLogs.Read

Faculty:
  - Students.Read (limited to own classes)
  - Courses.Read
  - Sections.Read, Sections.ViewRoster
  - Grades.Read, Grades.Submit, Grades.Update
  - Transcripts.ReadAll

Student:
  - Students.ReadOwn
  - Courses.Read
  - Sections.Read
  - Registration.Self
  - Grades.ReadOwn
  - Billing.ReadOwn
  - Transcripts.ReadOwn
```

---

# DATABASE SCHEMA (SQL Server)

```sql
-- =============================================
-- IDENTITY & USER MANAGEMENT TABLES
-- =============================================

CREATE TABLE [dbo].[AspNetUsers] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [UserName] NVARCHAR(256) NULL,
    [NormalizedUserName] NVARCHAR(256) NULL,
    [Email] NVARCHAR(256) NULL,
    [NormalizedEmail] NVARCHAR(256) NULL,
    [EmailConfirmed] BIT NOT NULL,
    [PasswordHash] NVARCHAR(MAX) NULL,
    [SecurityStamp] NVARCHAR(MAX) NULL,
    [ConcurrencyStamp] NVARCHAR(MAX) NULL,
    [PhoneNumber] NVARCHAR(MAX) NULL,
    [PhoneNumberConfirmed] BIT NOT NULL,
    [TwoFactorEnabled] BIT NOT NULL,
    [LockoutEnd] DATETIMEOFFSET NULL,
    [LockoutEnabled] BIT NOT NULL,
    [AccessFailedCount] INT NOT NULL,

    -- Extended fields
    [FirstName] NVARCHAR(100) NOT NULL,
    [LastName] NVARCHAR(100) NOT NULL,
    [DisplayName] NVARCHAR(100) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [MustChangePassword] BIT NOT NULL DEFAULT 0,
    [PasswordChangedAt] DATETIME2 NULL,
    [LastLoginAt] DATETIME2 NULL,
    [LastLoginIp] NVARCHAR(50) NULL,
    [FailedLoginAttempts] INT NOT NULL DEFAULT 0,
    [LockoutEndAt] DATETIME2 NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [CreatedById] UNIQUEIDENTIFIER NULL,
    [ModifiedAt] DATETIME2 NULL,
    [ModifiedById] UNIQUEIDENTIFIER NULL
);

CREATE TABLE [dbo].[AspNetRoles] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [Name] NVARCHAR(256) NULL,
    [NormalizedName] NVARCHAR(256) NULL,
    [ConcurrencyStamp] NVARCHAR(MAX) NULL,

    -- Extended fields
    [Description] NVARCHAR(500) NULL,
    [IsSystem] BIT NOT NULL DEFAULT 0,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [CreatedById] UNIQUEIDENTIFIER NULL,
    [ModifiedAt] DATETIME2 NULL,
    [ModifiedById] UNIQUEIDENTIFIER NULL
);

CREATE TABLE [dbo].[Permissions] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [Name] NVARCHAR(100) NOT NULL UNIQUE,
    [DisplayName] NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(500) NULL,
    [Module] NVARCHAR(50) NOT NULL,
    [Action] NVARCHAR(50) NOT NULL,
    [IsSystem] BIT NOT NULL DEFAULT 1
);

CREATE TABLE [dbo].[RolePermissions] (
    [RoleId] UNIQUEIDENTIFIER NOT NULL,
    [PermissionId] UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY ([RoleId], [PermissionId]),
    FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles]([Id]) ON DELETE CASCADE,
    FOREIGN KEY ([PermissionId]) REFERENCES [Permissions]([Id]) ON DELETE CASCADE
);

CREATE TABLE [dbo].[UserProfiles] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL UNIQUE,
    [AvatarUrl] NVARCHAR(500) NULL,
    [AvatarThumbnailUrl] NVARCHAR(500) NULL,
    [PhoneNumber] NVARCHAR(20) NULL,
    [DateOfBirth] DATE NULL,
    [Bio] NVARCHAR(1000) NULL,
    [JobTitle] NVARCHAR(100) NULL,
    [Department] NVARCHAR(100) NULL,
    [Location] NVARCHAR(100) NULL,
    [Visibility] NVARCHAR(20) NOT NULL DEFAULT 'Internal',
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [ModifiedAt] DATETIME2 NULL,
    FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers]([Id]) ON DELETE CASCADE
);

CREATE TABLE [dbo].[UserSettings] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL UNIQUE,

    -- Theme
    [Theme] NVARCHAR(20) NOT NULL DEFAULT 'System',
    [AccentColor] NVARCHAR(20) NULL,
    [Density] NVARCHAR(20) NOT NULL DEFAULT 'Comfortable',

    -- Regional
    [Language] NVARCHAR(10) NOT NULL DEFAULT 'en-US',
    [DateFormat] NVARCHAR(20) NOT NULL DEFAULT 'MM/dd/yyyy',
    [TimeFormat] NVARCHAR(20) NOT NULL DEFAULT 'h:mm tt',
    [Timezone] NVARCHAR(50) NOT NULL DEFAULT 'UTC',

    -- Accessibility
    [HighContrastMode] BIT NOT NULL DEFAULT 0,
    [ReducedMotion] BIT NOT NULL DEFAULT 0,
    [FontSize] NVARCHAR(20) NOT NULL DEFAULT 'Medium',

    -- Notifications
    [EmailNotifications] BIT NOT NULL DEFAULT 1,
    [PushNotifications] BIT NOT NULL DEFAULT 1,
    [InAppNotifications] BIT NOT NULL DEFAULT 1,
    [DigestFrequency] NVARCHAR(20) NOT NULL DEFAULT 'Immediate',
    [QuietHoursStart] TIME NULL,
    [QuietHoursEnd] TIME NULL,

    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [ModifiedAt] DATETIME2 NULL,
    FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers]([Id]) ON DELETE CASCADE
);

CREATE TABLE [dbo].[UserSessions] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [DeviceInfo] NVARCHAR(200) NOT NULL,
    [Browser] NVARCHAR(100) NOT NULL,
    [OperatingSystem] NVARCHAR(100) NOT NULL,
    [IpAddress] NVARCHAR(50) NOT NULL,
    [Location] NVARCHAR(200) NULL,
    [LoginAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [LastActivityAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [LogoutAt] DATETIME2 NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers]([Id]) ON DELETE CASCADE
);

CREATE TABLE [dbo].[RefreshTokens] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Token] NVARCHAR(500) NOT NULL,
    [JwtId] NVARCHAR(500) NOT NULL,
    [IsUsed] BIT NOT NULL DEFAULT 0,
    [IsRevoked] BIT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [ExpiresAt] DATETIME2 NOT NULL,
    [ReplacedByToken] NVARCHAR(500) NULL,
    FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers]([Id]) ON DELETE CASCADE
);

CREATE TABLE [dbo].[PasswordHistories] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [PasswordHash] NVARCHAR(MAX) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers]([Id]) ON DELETE CASCADE
);

-- =============================================
-- NOTIFICATION TABLES
-- =============================================

CREATE TABLE [dbo].[Notifications] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Type] NVARCHAR(50) NOT NULL,
    [Title] NVARCHAR(200) NOT NULL,
    [Message] NVARCHAR(1000) NOT NULL,
    [ActionUrl] NVARCHAR(500) NULL,
    [ActionText] NVARCHAR(100) NULL,
    [Icon] NVARCHAR(50) NULL,
    [IsRead] BIT NOT NULL DEFAULT 0,
    [ReadAt] DATETIME2 NULL,
    [IsArchived] BIT NOT NULL DEFAULT 0,
    [ArchivedAt] DATETIME2 NULL,
    [ExpiresAt] DATETIME2 NULL,
    [Priority] NVARCHAR(20) NOT NULL DEFAULT 'Normal',
    [EntityType] NVARCHAR(100) NULL,
    [EntityId] UNIQUEIDENTIFIER NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers]([Id]) ON DELETE CASCADE
);

CREATE TABLE [dbo].[UserNotificationPreferences] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [NotificationType] NVARCHAR(50) NOT NULL,
    [EmailEnabled] BIT NOT NULL DEFAULT 1,
    [PushEnabled] BIT NOT NULL DEFAULT 1,
    [InAppEnabled] BIT NOT NULL DEFAULT 1,
    FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers]([Id]) ON DELETE CASCADE,
    UNIQUE ([UserId], [NotificationType])
);

-- =============================================
-- AUDIT LOG TABLE
-- =============================================

CREATE TABLE [dbo].[AuditLogs] (
    [Id] BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [AuditId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),

    -- Who
    [UserId] UNIQUEIDENTIFIER NULL,
    [UserName] NVARCHAR(256) NULL,
    [UserEmail] NVARCHAR(256) NULL,
    [ImpersonatedById] UNIQUEIDENTIFIER NULL,

    -- What
    [Action] NVARCHAR(50) NOT NULL,
    [EntityType] NVARCHAR(100) NOT NULL,
    [EntityId] NVARCHAR(100) NULL,
    [EntityName] NVARCHAR(500) NULL,

    -- Changes
    [OldValues] NVARCHAR(MAX) NULL,
    [NewValues] NVARCHAR(MAX) NULL,
    [ChangedColumns] NVARCHAR(MAX) NULL,
    [ChangesSummary] NVARCHAR(1000) NULL,

    -- Context
    [IpAddress] NVARCHAR(50) NULL,
    [UserAgent] NVARCHAR(500) NULL,
    [SessionId] UNIQUEIDENTIFIER NULL,
    [CorrelationId] NVARCHAR(100) NULL,
    [RequestPath] NVARCHAR(500) NULL,
    [RequestMethod] NVARCHAR(10) NULL,

    -- Timing
    [Timestamp] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [DurationMs] BIGINT NULL,

    -- Additional
    [AdditionalData] NVARCHAR(MAX) NULL,
    [Severity] NVARCHAR(20) NOT NULL DEFAULT 'Info',
    [ErrorMessage] NVARCHAR(MAX) NULL,

    -- Integrity
    [PreviousHash] NVARCHAR(100) NULL,
    [Hash] NVARCHAR(100) NOT NULL
);

CREATE INDEX [IX_AuditLogs_Timestamp] ON [AuditLogs]([Timestamp] DESC);
CREATE INDEX [IX_AuditLogs_UserId] ON [AuditLogs]([UserId]);
CREATE INDEX [IX_AuditLogs_EntityType_EntityId] ON [AuditLogs]([EntityType], [EntityId]);
CREATE INDEX [IX_AuditLogs_Action] ON [AuditLogs]([Action]);

-- =============================================
-- CORE ACADEMIC TABLES (Student, Course, etc.)
-- (Same as before, with audit fields added)
-- =============================================

CREATE TABLE [dbo].[Departments] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [Code] NVARCHAR(10) NOT NULL UNIQUE,
    [Name] NVARCHAR(255) NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [CreatedById] UNIQUEIDENTIFIER NULL,
    [ModifiedAt] DATETIME2 NULL,
    [ModifiedById] UNIQUEIDENTIFIER NULL
);

CREATE TABLE [dbo].[Programs] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [Code] NVARCHAR(20) NOT NULL UNIQUE,
    [Name] NVARCHAR(255) NOT NULL,
    [DepartmentId] UNIQUEIDENTIFIER NOT NULL,
    [DegreeType] NVARCHAR(50) NOT NULL,
    [TotalCreditsRequired] INT NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [CreatedById] UNIQUEIDENTIFIER NULL,
    [ModifiedAt] DATETIME2 NULL,
    [ModifiedById] UNIQUEIDENTIFIER NULL,
    FOREIGN KEY ([DepartmentId]) REFERENCES [Departments]([Id])
);

CREATE TABLE [dbo].[Terms] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [Code] NVARCHAR(20) NOT NULL UNIQUE,
    [Name] NVARCHAR(100) NOT NULL,
    [StartDate] DATE NOT NULL,
    [EndDate] DATE NOT NULL,
    [RegistrationStart] DATE NULL,
    [RegistrationEnd] DATE NULL,
    [AddDropDeadline] DATE NULL,
    [WithdrawDeadline] DATE NULL,
    [GradesDue] DATE NULL,
    [IsCurrent] BIT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [ModifiedAt] DATETIME2 NULL
);

CREATE TABLE [dbo].[Students] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    [UserId] UNIQUEIDENTIFIER NULL,
    [StudentId] NVARCHAR(20) NOT NULL UNIQUE,
    [LegalFirstName] NVARCHAR(100) NOT NULL,
    [LegalLastName] NVARCHAR(100) NOT NULL,
    [MiddleName] NVARCHAR(100) NULL,
    [PreferredFirstName] NVARCHAR(100) NULL,
    [DateOfBirth] DATE NOT NULL,
    [Gender] NVARCHAR(20) NULL,
    [Pronouns] NVARCHAR(50) NULL,
    [UniversityEmail] NVARCHAR(255) NOT NULL UNIQUE,
    [PersonalEmail] NVARCHAR(255) NULL,
    [PhoneNumber] NVARCHAR(20) NULL,
    [ProgramId] UNIQUEIDENTIFIER NOT NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Active',
    [AcademicLevel] NVARCHAR(50) NOT NULL,
    [AcademicStanding] NVARCHAR(50) NOT NULL DEFAULT 'Good',
    [EnrollmentDate] DATE NOT NULL,
    [ExpectedGraduationDate] DATE NULL,
    [IsInternational] BIT NOT NULL DEFAULT 0,
    [IsVeteran] BIT NOT NULL DEFAULT 0,
    [IsFirstGeneration] BIT NOT NULL DEFAULT 0,
    [IsHonorsStudent] BIT NOT NULL DEFAULT 0,
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    [DeletedAt] DATETIME2 NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [CreatedById] UNIQUEIDENTIFIER NULL,
    [ModifiedAt] DATETIME2 NULL,
    [ModifiedById] UNIQUEIDENTIFIER NULL,
    FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers]([Id]),
    FOREIGN KEY ([ProgramId]) REFERENCES [Programs]([Id])
);

-- ... (Additional tables for Courses, Sections, Enrollments, Grades, Billing)
-- Same structure as before but with audit fields (CreatedAt, CreatedById, ModifiedAt, ModifiedById)
```

---

# SPRINT PLAN (7 Sprints - Extended for Enterprise Features)

## Sprint 1: Solution Architecture & Infrastructure
**Goal**: Project foundation with CQRS, authentication, and base infrastructure

### Deliverables
- [ ] Solution structure with Clean Architecture
- [ ] CQRS setup with MediatR
- [ ] Pipeline behaviors (validation, logging, transaction, audit)
- [ ] SQL Server database with migrations
- [ ] JWT authentication with refresh tokens
- [ ] Base API controller with error handling
- [ ] React frontend setup
- [ ] Login page
- [ ] Sprint documentation

---

## Sprint 2: Enterprise User Management
**Goal**: Complete user management with profiles, settings, and sessions

### Deliverables
- [ ] User CRUD with full controllers
- [ ] User profiles with avatar upload
- [ ] User settings (theme, regional, accessibility)
- [ ] Session management
- [ ] Password management (change, history, force reset)
- [ ] React user management pages
- [ ] Profile and settings pages
- [ ] Theme system implementation
- [ ] Sprint documentation

---

## Sprint 3: Roles, Permissions & Audit System
**Goal**: Granular permissions and financial-grade audit logging

### Deliverables
- [ ] Permission system implementation
- [ ] Role management with permission assignment
- [ ] Authorization behavior in MediatR pipeline
- [ ] RequirePermission attribute
- [ ] Audit logging system (EF interceptor)
- [ ] Audit log API endpoints
- [ ] React role/permission management
- [ ] Audit log viewer
- [ ] Sprint documentation

---

## Sprint 4: Student Management & Notifications
**Goal**: Student CRUD and notification system

### Deliverables
- [ ] Student CRUD with CQRS
- [ ] Student search and export
- [ ] Holds management
- [ ] Notification system
- [ ] Notification preferences
- [ ] React student management
- [ ] Student dashboard
- [ ] Notification bell and viewer
- [ ] Sprint documentation

---

## Sprint 5: Courses & Registration
**Goal**: Course catalog and registration workflow

### Deliverables
- [ ] Course/Section CRUD
- [ ] Registration cart and processing
- [ ] Prerequisite validation
- [ ] Schedule calendar
- [ ] React course catalog
- [ ] Registration UI
- [ ] Schedule view
- [ ] Sprint documentation

---

## Sprint 6: Grading & Billing
**Goal**: Grade entry and billing system

### Deliverables
- [ ] Grade entry with roster view
- [ ] GPA calculation
- [ ] Billing account management
- [ ] Payment processing
- [ ] React grading pages
- [ ] Billing statements
- [ ] Sprint documentation

---

## Sprint 7: Transcripts, Reports & Polish
**Goal**: PDF generation, reports, and final polish

### Deliverables
- [ ] PDF transcript generation
- [ ] Admin dashboard with analytics
- [ ] Reports and exports
- [ ] Bug fixes and polish
- [ ] Demo data seeding
- [ ] Complete documentation
- [ ] README with screenshots
- [ ] Sprint documentation

---

# SUCCESS CRITERIA

## Architecture
- [ ] CQRS pattern properly implemented with MediatR
- [ ] Clean Architecture layers correctly separated
- [ ] Full Controllers (not Minimal APIs)
- [ ] SQL Server database with proper indexes
- [ ] All pipeline behaviors working (validation, logging, audit, transaction)

## User Management
- [ ] Complete user lifecycle management
- [ ] Profile with avatar upload working
- [ ] Settings with theme persistence
- [ ] Password policies enforced
- [ ] Session management functional
- [ ] Multi-device logout working

## Security
- [ ] Granular permission system working
- [ ] Role-based + permission-based authorization
- [ ] JWT with refresh token rotation
- [ ] Account lockout after failed attempts
- [ ] All sensitive actions audit logged

## Audit System
- [ ] Every CRUD operation logged
- [ ] Authentication events logged
- [ ] Old/new values captured for updates
- [ ] Immutable audit trail
- [ ] Searchable and exportable logs

## Notifications
- [ ] In-app notifications working
- [ ] Notification preferences honored
- [ ] Unread count displayed
- [ ] Mark as read functionality

## Code Quality
- [ ] 70%+ test coverage on handlers
- [ ] TypeScript strict mode (no errors)
- [ ] No critical security vulnerabilities
- [ ] API response times < 200ms

---

# EXECUTION ORDER

1. **Sprint 1**: Backend infrastructure first, then React setup, then auth flow
2. **Sprint 2**: User management backend, then React pages for profile/settings
3. **Sprint 3**: Permission system is foundational - complete before other features
4. **Sprint 4-6**: Feature modules with full CQRS pattern
5. **Sprint 7**: Polish and documentation

**Key Principle**: Each feature goes through the full CQRS cycle:
1. Create Command/Query + Handler + Validator
2. Add Controller endpoint
3. Implement React API + UI
4. Verify audit logging
5. Add tests

---

Ready to build an enterprise-grade portfolio project!
