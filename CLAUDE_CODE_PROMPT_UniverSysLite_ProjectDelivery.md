# CLAUDE CODE PROJECT DELIVERY PROMPT
## Project: UniverSys Lite - Agile Delivery with Complete Documentation

---

# 🎯 PROJECT OVERVIEW

Build **UniverSys Lite**, a focused yet impressive University Management System that demonstrates professional software delivery practices. This project showcases not just coding skills, but **how a senior engineer plans, documents, executes, and hands over a project**.

## What Makes This Special

This isn't just code - it's a **complete project delivery package** including:
- Sprint planning with user stories
- Daily progress logs
- Technical documentation
- Staff training materials
- Onboarding guides
- Architecture decision records
- Handover documentation

**Goal**: Demonstrate you can deliver a project from concept to production-ready, with all the artifacts a real team needs.

---

# 📐 RIGHT-SIZED SCOPE

## Included Modules (Core 5)

```
UniverSys Lite
├── 🎓 Student Management (Core)
│   ├── Student profiles & records
│   ├── Program enrollment
│   └── Academic standing
│
├── 📚 Course & Registration
│   ├── Course catalog
│   ├── Section scheduling
│   ├── Student registration
│   └── Waitlist management
│
├── 📝 Grading & Transcripts
│   ├── Grade entry
│   ├── GPA calculation
│   ├── Transcript generation
│   └── Degree audit (simplified)
│
├── 💰 Student Billing
│   ├── Tuition calculation
│   ├── Payment tracking
│   ├── Account statements
│   └── Payment plans
│
└── 👥 User Management
    ├── Role-based access (Student, Faculty, Staff, Admin)
    ├── Authentication
    └── Profile management
```

## Excluded (Keep Focused)
- ❌ Housing & Dining
- ❌ Athletics
- ❌ Research Administration
- ❌ Alumni & Advancement
- ❌ Health Services
- ❌ Library System
- ❌ HR/Payroll

---

# 🏗️ TECHNICAL ARCHITECTURE

## Stack (Optimized for Speed)

```
Frontend:        Blazor Server (fast development, real-time)
Backend:         ASP.NET Core 8 Minimal APIs
Database:        SQLite (dev) → PostgreSQL (prod-ready)
ORM:             Entity Framework Core 8
Auth:            ASP.NET Core Identity + JWT
Caching:         In-Memory (IMemoryCache)
Validation:      FluentValidation
Mapping:         Mapster (faster than AutoMapper)
Testing:         xUnit + FluentAssertions
Docs:            Swagger/OpenAPI
```

## Solution Structure

```
UniverSysLite/
├── src/
│   ├── UniverSysLite.Domain/           # Entities, Enums, Exceptions
│   ├── UniverSysLite.Application/      # Use Cases, DTOs, Interfaces
│   ├── UniverSysLite.Infrastructure/   # EF Core, External Services
│   ├── UniverSysLite.API/              # REST API Endpoints
│   └── UniverSysLite.Web/              # Blazor Server UI
│
├── tests/
│   ├── UniverSysLite.UnitTests/
│   └── UniverSysLite.IntegrationTests/
│
├── docs/                               # 📚 ALL DOCUMENTATION LIVES HERE
│   ├── project-management/
│   │   ├── PROJECT_CHARTER.md
│   │   ├── PRODUCT_BACKLOG.md
│   │   ├── sprints/
│   │   │   ├── SPRINT_1.md
│   │   │   ├── SPRINT_2.md
│   │   │   └── ...
│   │   └── RELEASE_NOTES.md
│   │
│   ├── architecture/
│   │   ├── ARCHITECTURE_OVERVIEW.md
│   │   ├── DATABASE_SCHEMA.md
│   │   ├── API_DESIGN.md
│   │   └── decisions/
│   │       ├── ADR_001_database_choice.md
│   │       └── ...
│   │
│   ├── user-guides/
│   │   ├── STUDENT_GUIDE.md
│   │   ├── FACULTY_GUIDE.md
│   │   ├── REGISTRAR_GUIDE.md
│   │   └── ADMIN_GUIDE.md
│   │
│   ├── technical/
│   │   ├── DEVELOPER_SETUP.md
│   │   ├── CODING_STANDARDS.md
│   │   ├── TESTING_GUIDE.md
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   └── API_REFERENCE.md
│   │
│   └── training/
│       ├── ONBOARDING_CHECKLIST.md
│       ├── TECHNICAL_DEEP_DIVE.md
│       ├── FEATURE_DEVELOPMENT_TUTORIAL.md
│       └── TROUBLESHOOTING_GUIDE.md
│
├── scripts/
│   ├── seed-data.sql
│   └── demo-setup.ps1
│
└── UniverSysLite.sln
```

---

# 📋 PRODUCT BACKLOG

## Epic 1: Foundation & Infrastructure
```
US-001: Project Setup & Architecture
US-002: Database Schema & Migrations  
US-003: Authentication & Authorization
US-004: Base UI Layout & Navigation
```

## Epic 2: Student Management
```
US-010: View Student Directory
US-011: Create/Edit Student Profile
US-012: Student Search & Filters
US-013: Manage Student Status
US-014: Emergency Contact Management
US-015: Student Dashboard View
```

## Epic 3: Course Catalog & Scheduling
```
US-020: View Course Catalog
US-021: Create/Edit Courses
US-022: Manage Prerequisites
US-023: Create Course Sections
US-024: Assign Instructors to Sections
US-025: Room & Time Scheduling
US-026: Section Capacity Management
```

## Epic 4: Registration
```
US-030: Student Course Search
US-031: Add Courses to Cart
US-032: Register for Courses
US-033: Drop Courses
US-034: Waitlist Management
US-035: Registration Holds
US-036: View My Schedule
US-037: Faculty View Class Roster
```

## Epic 5: Grading
```
US-040: Faculty Grade Entry
US-041: Grade Calculations (GPA)
US-042: View Grades (Student)
US-043: Grade Change Workflow
US-044: Academic Standing Calculation
US-045: Transcript Generation (PDF)
```

## Epic 6: Billing
```
US-050: Tuition Calculation Rules
US-051: Generate Student Bill
US-052: Record Payments
US-053: View Account Statement
US-054: Payment Plan Setup
US-055: Account Holds
```

## Epic 7: Reporting & Polish
```
US-060: Enrollment Reports
US-061: Grade Distribution Reports
US-062: Financial Summary Reports
US-063: Dashboard Analytics
US-064: Data Export (CSV)
```

---

# 🏃 SPRINT PLAN (6 Sprints × 1 Week Each)

## Sprint 1: Foundation
**Goal**: Project skeleton with auth and basic UI

| ID | User Story | Points |
|----|------------|--------|
| US-001 | Project Setup & Architecture | 5 |
| US-002 | Database Schema & Migrations | 5 |
| US-003 | Authentication & Authorization | 5 |
| US-004 | Base UI Layout & Navigation | 3 |

**Deliverables**:
- Working solution structure
- Database with migrations
- Login/logout functionality
- Role-based navigation
- Sprint 1 documentation

---

## Sprint 2: Student Management
**Goal**: Complete student CRUD operations

| ID | User Story | Points |
|----|------------|--------|
| US-010 | View Student Directory | 3 |
| US-011 | Create/Edit Student Profile | 5 |
| US-012 | Student Search & Filters | 3 |
| US-013 | Manage Student Status | 2 |
| US-015 | Student Dashboard View | 5 |

**Deliverables**:
- Student management UI
- Student API endpoints
- Student dashboard
- Sprint 2 documentation

---

## Sprint 3: Courses & Scheduling
**Goal**: Course catalog and section management

| ID | User Story | Points |
|----|------------|--------|
| US-020 | View Course Catalog | 3 |
| US-021 | Create/Edit Courses | 5 |
| US-022 | Manage Prerequisites | 3 |
| US-023 | Create Course Sections | 5 |
| US-025 | Room & Time Scheduling | 3 |

**Deliverables**:
- Course catalog UI
- Section management
- Schedule grid view
- Sprint 3 documentation

---

## Sprint 4: Registration
**Goal**: Student registration workflow

| ID | User Story | Points |
|----|------------|--------|
| US-030 | Student Course Search | 3 |
| US-031 | Add Courses to Cart | 3 |
| US-032 | Register for Courses | 5 |
| US-033 | Drop Courses | 2 |
| US-034 | Waitlist Management | 5 |
| US-036 | View My Schedule | 3 |

**Deliverables**:
- Registration workflow
- Shopping cart experience
- Visual schedule
- Sprint 4 documentation

---

## Sprint 5: Grading & Billing
**Goal**: Grade entry and billing system

| ID | User Story | Points |
|----|------------|--------|
| US-040 | Faculty Grade Entry | 5 |
| US-041 | Grade Calculations (GPA) | 3 |
| US-042 | View Grades (Student) | 2 |
| US-051 | Generate Student Bill | 5 |
| US-052 | Record Payments | 3 |
| US-053 | View Account Statement | 2 |

**Deliverables**:
- Grade entry interface
- GPA calculations
- Billing generation
- Payment recording
- Sprint 5 documentation

---

## Sprint 6: Reports & Polish
**Goal**: Reports, transcript, and final polish

| ID | User Story | Points |
|----|------------|--------|
| US-045 | Transcript Generation (PDF) | 5 |
| US-060 | Enrollment Reports | 3 |
| US-061 | Grade Distribution Reports | 3 |
| US-063 | Dashboard Analytics | 5 |
| BUG | Bug fixes and polish | 5 |

**Deliverables**:
- PDF transcripts
- Admin dashboard with charts
- All documentation complete
- Demo data seeded
- Sprint 6 documentation

---

# 📝 DOCUMENTATION TEMPLATES

## Template 1: Sprint Document

Create this for EACH sprint at `/docs/project-management/sprints/SPRINT_X.md`:

```markdown
# Sprint [X] - [Sprint Name]

## Sprint Goal
[One sentence describing what we're achieving]

## Sprint Duration
- **Start Date**: YYYY-MM-DD
- **End Date**: YYYY-MM-DD
- **Working Days**: 5

---

## 📋 Sprint Backlog

| ID | User Story | Priority | Points | Status |
|----|------------|----------|--------|--------|
| US-XXX | [Story Title] | High | 5 | ✅ Done |
| US-XXX | [Story Title] | Medium | 3 | 🔄 In Progress |
| US-XXX | [Story Title] | Low | 2 | 📋 To Do |

**Total Points**: XX | **Completed**: XX | **Velocity**: XX

---

## 📅 Daily Progress Log

### Day 1 (YYYY-MM-DD)
**Completed**:
- [x] Task description
- [x] Task description

**In Progress**:
- [ ] Task description

**Blockers**: None

**Notes**: [Any observations or decisions made]

---

### Day 2 (YYYY-MM-DD)
[Repeat format...]

---

## 🎯 Sprint Deliverables

### Features Delivered
1. **[Feature Name]**: Brief description
   - Screenshots/GIFs if applicable

### API Endpoints Added
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/students | List all students |
| POST | /api/students | Create student |

### Database Changes
- Added `Students` table
- Added `Programs` table

### UI Screens Added
1. Student List (`/students`)
2. Student Detail (`/students/{id}`)

---

## 🐛 Issues & Resolutions

| Issue | Resolution | Time Spent |
|-------|------------|------------|
| [Issue description] | [How it was resolved] | 2h |

---

## 📊 Sprint Metrics

- **Planned Points**: XX
- **Completed Points**: XX
- **Completion Rate**: XX%
- **Bugs Found**: X
- **Bugs Fixed**: X

---

## 🔍 Sprint Retrospective

### What Went Well
- Point 1
- Point 2

### What Could Be Improved
- Point 1
- Point 2

### Action Items for Next Sprint
- [ ] Action 1
- [ ] Action 2

---

## 📸 Sprint Demo Screenshots

[Include 2-3 screenshots of key features built this sprint]
```

---

## Template 2: User Story Detail

For complex stories, create detailed specs:

```markdown
# User Story: US-032 Register for Courses

## Story
**As a** student
**I want to** register for courses in my shopping cart
**So that** I am officially enrolled in classes for the term

## Acceptance Criteria

```gherkin
GIVEN I am a logged-in student
AND I have courses in my registration cart
AND I have no registration holds
WHEN I click "Register All"
THEN I should be enrolled in all eligible courses
AND my schedule should update immediately
AND I should see a confirmation message
AND I should receive a confirmation email

GIVEN I am registering for a course
AND the course is at capacity
AND I am eligible for the waitlist
WHEN registration fails due to capacity
THEN I should be offered to join the waitlist
AND my position should be displayed

GIVEN I am registering for a course  
AND I don't meet the prerequisites
WHEN I attempt to register
THEN registration should be blocked
AND I should see which prerequisites I'm missing
```

## Technical Notes

### API Endpoint
```
POST /api/registration/register
{
  "studentId": "guid",
  "sectionIds": ["guid", "guid"],
  "termId": "guid"
}
```

### Response
```json
{
  "success": true,
  "enrollments": [...],
  "waitlisted": [...],
  "failed": [
    {
      "sectionId": "guid",
      "reason": "PREREQUISITE_NOT_MET",
      "details": "Missing CS 101"
    }
  ]
}
```

### Business Rules
1. Check student has no holds
2. Validate prerequisites for each course
3. Check time conflicts
4. Check credit hour limits
5. Check section capacity
6. Process in order (priority courses first)

### UI Mockup
[ASCII diagram or description]

## Definition of Done
- [ ] API endpoint implemented
- [ ] UI workflow complete
- [ ] Unit tests written (>80% coverage)
- [ ] Integration test for happy path
- [ ] Error handling complete
- [ ] Loading states implemented
- [ ] Confirmation email triggers
- [ ] Documentation updated
```

---

## Template 3: Architecture Decision Record (ADR)

Create at `/docs/architecture/decisions/ADR_XXX_title.md`:

```markdown
# ADR-001: Database Choice

## Status
**Accepted** | Date: YYYY-MM-DD

## Context
We need to choose a database for UniverSys Lite that balances:
- Development speed
- Portfolio demonstration value
- Production readiness
- Cost (free tier important)

## Decision
We will use **SQLite for development** and **PostgreSQL for production**.

## Rationale

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| SQL Server | Industry standard, EF Core support | Heavy, licensing cost |
| PostgreSQL | Free, powerful, EF Core support | Requires setup |
| SQLite | Zero config, portable, fast | Limited concurrency |
| MySQL | Popular, free | Less EF Core features |

### Why This Decision
1. SQLite allows instant setup - no database server needed
2. PostgreSQL is production-proven and free
3. EF Core makes switching trivial (same code)
4. Demonstrates real-world multi-environment setup

## Consequences

### Positive
- Developers can clone and run immediately
- No database license costs
- Shows production-ready thinking

### Negative
- Must test on PostgreSQL before deployment
- Some SQLite limitations (no stored procedures)

### Mitigation
- CI pipeline tests against PostgreSQL
- Avoid SQLite-specific features
```

---

# 📚 TRAINING & ONBOARDING DOCUMENTATION

## Document 1: Onboarding Checklist

Create at `/docs/training/ONBOARDING_CHECKLIST.md`:

```markdown
# 🎓 New Team Member Onboarding Checklist

Welcome to UniverSys Lite! This checklist will get you productive in 2-3 days.

## Day 1: Environment Setup

### Prerequisites
- [ ] .NET 8 SDK installed ([download](https://dotnet.microsoft.com))
- [ ] VS Code or Visual Studio 2022
- [ ] Git installed
- [ ] Node.js 18+ (for tooling)

### Repository Setup
- [ ] Clone repository: `git clone [repo-url]`
- [ ] Open solution: `UniverSysLite.sln`
- [ ] Restore packages: `dotnet restore`
- [ ] Run migrations: `dotnet ef database update -p src/UniverSysLite.Infrastructure`
- [ ] Seed demo data: `dotnet run --project scripts/SeedData`
- [ ] Run application: `dotnet run --project src/UniverSysLite.Web`
- [ ] Verify: Navigate to `https://localhost:5001`

### Verification
- [ ] Can log in as admin (`admin@university.edu` / `Admin123!`)
- [ ] Can log in as student (`student@university.edu` / `Student123!`)
- [ ] Can view student directory
- [ ] Can view course catalog

---

## Day 1-2: Codebase Orientation

### Architecture Overview
- [ ] Read `/docs/architecture/ARCHITECTURE_OVERVIEW.md`
- [ ] Review solution structure (15 min)
- [ ] Understand layer responsibilities:
  - Domain: Entities, business rules
  - Application: Use cases, DTOs
  - Infrastructure: Database, external services
  - API: REST endpoints
  - Web: Blazor UI

### Key Concepts
- [ ] Review entity models in `UniverSysLite.Domain/Entities`
- [ ] Understand the `Student` entity lifecycle
- [ ] Review a complete feature (Student CRUD):
  - Entity: `Student.cs`
  - DTO: `StudentDto.cs`
  - Service: `IStudentService.cs` → `StudentService.cs`
  - API: `StudentEndpoints.cs`
  - UI: `/Pages/Students/`

### Database
- [ ] Review schema at `/docs/architecture/DATABASE_SCHEMA.md`
- [ ] Examine migrations in `Infrastructure/Migrations`
- [ ] Understand seed data

---

## Day 2-3: Hands-On Tasks

### Task 1: Bug Fix (Easy)
Find and fix a minor UI alignment issue.
- Teaches: UI structure, Blazor components

### Task 2: Small Feature (Medium)
Add "Export to CSV" button on Student List page.
- Teaches: Service layer, API endpoints, UI integration

### Task 3: New Field (Medium)
Add "Preferred Name" field to Student profile.
- Teaches: Full stack change (DB → API → UI)

See `/docs/training/FEATURE_DEVELOPMENT_TUTORIAL.md` for guidance.

---

## Day 3+: Deep Dives

- [ ] Read coding standards
- [ ] Review testing approach
- [ ] Shadow a feature development
- [ ] Complete first PR with code review

---

## Resources

| Resource | Location |
|----------|----------|
| Architecture Overview | `/docs/architecture/ARCHITECTURE_OVERVIEW.md` |
| API Reference | `/docs/technical/API_REFERENCE.md` |
| Coding Standards | `/docs/technical/CODING_STANDARDS.md` |
| Testing Guide | `/docs/technical/TESTING_GUIDE.md` |
| Troubleshooting | `/docs/training/TROUBLESHOOTING_GUIDE.md` |

---

## Questions?

- Check Troubleshooting Guide first
- Search existing issues/PRs
- Ask in team chat with context

**Welcome aboard! 🚀**
```

---

## Document 2: Technical Deep Dive

Create at `/docs/training/TECHNICAL_DEEP_DIVE.md`:

```markdown
# 🔬 Technical Deep Dive

This document explains HOW and WHY UniverSys Lite is built the way it is.

---

## Architecture Philosophy

### Clean Architecture
We follow Clean Architecture (aka Onion Architecture):

```
┌─────────────────────────────────────────┐
│              Presentation               │  ← Blazor UI, API Controllers
├─────────────────────────────────────────┤
│              Application                │  ← Use Cases, DTOs, Interfaces
├─────────────────────────────────────────┤
│                Domain                   │  ← Entities, Business Rules
├─────────────────────────────────────────┤
│             Infrastructure              │  ← EF Core, External Services
└─────────────────────────────────────────┘

Dependencies flow INWARD. Domain has no dependencies.
```

**Why?**
- Testable: Business logic isolated from frameworks
- Flexible: Can swap database/UI without changing core
- Maintainable: Clear boundaries and responsibilities

### Project Dependencies

```
Web → API → Application → Domain
              ↓
         Infrastructure
```

- `Domain`: Zero dependencies
- `Application`: Depends on Domain only
- `Infrastructure`: Implements Application interfaces
- `API`: Orchestrates Application services
- `Web`: Consumes API, renders UI

---

## Key Patterns Explained

### Repository Pattern
**What**: Abstracts data access behind interfaces
**Where**: `Application/Interfaces/IStudentRepository.cs`
**Why**: 
- Testable (mock the repository)
- Swappable (change from EF to Dapper without touching services)

```csharp
// Interface in Application layer
public interface IStudentRepository
{
    Task<Student?> GetByIdAsync(Guid id);
    Task<IEnumerable<Student>> GetAllAsync();
    Task AddAsync(Student student);
    Task UpdateAsync(Student student);
}

// Implementation in Infrastructure layer
public class StudentRepository : IStudentRepository
{
    private readonly AppDbContext _context;
    // ... implementation using EF Core
}
```

### Service Layer
**What**: Contains business logic and orchestration
**Where**: `Application/Services/`
**Why**: 
- Keeps controllers/endpoints thin
- Business logic in one place
- Easy to test

```csharp
public class RegistrationService : IRegistrationService
{
    public async Task<RegistrationResult> RegisterAsync(
        Guid studentId, 
        List<Guid> sectionIds)
    {
        // 1. Validate student has no holds
        // 2. Check prerequisites
        // 3. Check time conflicts
        // 4. Check capacity
        // 5. Create enrollments
        // 6. Send confirmation
    }
}
```

### DTOs (Data Transfer Objects)
**What**: Separate API contracts from domain entities
**Where**: `Application/DTOs/`
**Why**:
- Don't expose internal entity structure
- Version API independently
- Control what's serialized

```csharp
// Entity (internal)
public class Student
{
    public Guid Id { get; set; }
    public string PasswordHash { get; set; }  // Never expose!
    public List<Enrollment> Enrollments { get; set; }
}

// DTO (external)
public class StudentDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; }
    public int EnrollmentCount { get; set; }  // Computed
}
```

---

## Database Design Decisions

### Why Guid Primary Keys?
- No coordination needed for distributed systems
- Secure: IDs aren't guessable
- Easy to generate in code before saving

### Soft Deletes
We use soft deletes for critical entities:
```csharp
public class Student
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
```
**Why**: Audit trail, easy recovery, referential integrity

### Audit Fields
All entities inherit:
```csharp
public abstract class BaseEntity
{
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public string ModifiedBy { get; set; }
}
```

---

## Authentication & Authorization

### Authentication Flow
1. User submits credentials
2. API validates against Identity
3. JWT token returned
4. Token stored in browser (httpOnly cookie)
5. Token sent with each request
6. API validates token on each request

### Authorization Model
Role-based with these roles:
- **Student**: View own data, register for courses
- **Faculty**: View roster, enter grades
- **Staff**: Manage students, courses, billing
- **Admin**: Full access

```csharp
[Authorize(Roles = "Staff,Admin")]
public async Task<IActionResult> CreateStudent(...)

[Authorize(Policy = "CanEnterGrades")]
public async Task<IActionResult> SubmitGrades(...)
```

---

## Performance Considerations

### Database Query Optimization
```csharp
// ❌ Bad: N+1 query problem
var students = await _context.Students.ToListAsync();
foreach (var student in students)
{
    var enrollments = student.Enrollments; // Lazy load = N queries!
}

// ✅ Good: Eager loading
var students = await _context.Students
    .Include(s => s.Enrollments)
    .ToListAsync();
```

### Caching Strategy
```csharp
// Cache course catalog (changes infrequently)
public async Task<List<CourseDto>> GetCoursesAsync()
{
    return await _cache.GetOrCreateAsync("courses", async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30);
        return await _repository.GetAllCoursesAsync();
    });
}
```

---

## Error Handling

### API Error Responses
Consistent error format:
```json
{
  "type": "validation_error",
  "title": "Validation Failed",
  "status": 400,
  "errors": {
    "email": ["Email is required", "Email format is invalid"],
    "birthDate": ["Must be in the past"]
  }
}
```

### Exception Handling
```csharp
// Custom exceptions
public class StudentNotFoundException : Exception { }
public class RegistrationBlockedException : Exception { }

// Global handler maps to HTTP status
app.UseExceptionHandler(handler =>
{
    handler.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var response = exception switch
        {
            StudentNotFoundException => (404, "Student not found"),
            RegistrationBlockedException => (409, "Registration blocked"),
            _ => (500, "Internal error")
        };
        // Write response...
    });
});
```

---

## Testing Strategy

### Unit Tests
Test business logic in isolation:
```csharp
[Fact]
public void CalculateGPA_WithMixedGrades_ReturnsCorrectGPA()
{
    var grades = new List<Grade>
    {
        new Grade { LetterGrade = "A", Credits = 3 },  // 4.0 × 3 = 12
        new Grade { LetterGrade = "B", Credits = 3 },  // 3.0 × 3 = 9
    };
    
    var gpa = GpaCalculator.Calculate(grades);
    
    Assert.Equal(3.5m, gpa);  // (12 + 9) / 6 = 3.5
}
```

### Integration Tests
Test API endpoints with real database:
```csharp
[Fact]
public async Task CreateStudent_WithValidData_ReturnsCreated()
{
    var client = _factory.CreateClient();
    var response = await client.PostAsJsonAsync("/api/students", new
    {
        FirstName = "John",
        LastName = "Doe",
        Email = "john.doe@test.edu"
    });
    
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
}
```

---

## Common Tasks Reference

### Adding a New Entity
1. Create entity in `Domain/Entities`
2. Add DbSet in `AppDbContext`
3. Create migration: `dotnet ef migrations add AddNewEntity`
4. Create DTOs in `Application/DTOs`
5. Create repository interface + implementation
6. Create service
7. Add API endpoints
8. Add UI pages

### Adding a New API Endpoint
1. Define route in `API/Endpoints/`
2. Call application service
3. Map response to DTO
4. Add to Swagger documentation
5. Add authorization attribute
6. Write integration test

See `/docs/training/FEATURE_DEVELOPMENT_TUTORIAL.md` for step-by-step walkthrough.
```

---

## Document 3: Feature Development Tutorial

Create at `/docs/training/FEATURE_DEVELOPMENT_TUTORIAL.md`:

```markdown
# 🛠️ Feature Development Tutorial

Learn by doing! This tutorial walks through adding a complete feature.

## Feature: Add "Preferred Name" to Student

### Requirements
- Students can set a preferred first name
- Display preferred name (if set) in UI, fall back to legal name
- Track when preferred name was last updated

---

## Step 1: Update Domain Entity

**File**: `src/UniverSysLite.Domain/Entities/Student.cs`

```csharp
public class Student : BaseEntity
{
    // Existing properties...
    
    // ADD THESE:
    public string? PreferredFirstName { get; private set; }
    public DateTime? PreferredNameUpdatedAt { get; private set; }
    
    // Add computed property
    public string DisplayFirstName => PreferredFirstName ?? FirstName;
    public string DisplayFullName => $"{DisplayFirstName} {LastName}";
    
    // Add method to update (encapsulation)
    public void UpdatePreferredName(string? preferredName)
    {
        PreferredFirstName = preferredName?.Trim();
        PreferredNameUpdatedAt = preferredName != null ? DateTime.UtcNow : null;
    }
}
```

**Why private set?** Encapsulation - force changes through methods so we can add validation/logic.

---

## Step 2: Create Migration

Run in terminal:
```bash
cd src/UniverSysLite.Infrastructure
dotnet ef migrations add AddStudentPreferredName
```

**Verify migration** in `Migrations/` folder:
```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<string>(
        name: "PreferredFirstName",
        table: "Students",
        nullable: true);
        
    migrationBuilder.AddColumn<DateTime>(
        name: "PreferredNameUpdatedAt",
        table: "Students",
        nullable: true);
}
```

Apply migration:
```bash
dotnet ef database update
```

---

## Step 3: Update DTOs

**File**: `src/UniverSysLite.Application/DTOs/StudentDto.cs`

```csharp
public class StudentDto
{
    // Existing...
    
    public string? PreferredFirstName { get; set; }
    public string DisplayName { get; set; }  // Computed in mapping
}

public class UpdateStudentDto
{
    // Existing...
    
    [MaxLength(50)]
    public string? PreferredFirstName { get; set; }
}
```

---

## Step 4: Update Mapping

**File**: `src/UniverSysLite.Application/Mappings/StudentMappings.cs`

```csharp
public static StudentDto ToDto(this Student student)
{
    return new StudentDto
    {
        Id = student.Id,
        FirstName = student.FirstName,
        LastName = student.LastName,
        PreferredFirstName = student.PreferredFirstName,
        DisplayName = student.DisplayFullName,  // Uses computed property
        // ... other mappings
    };
}
```

---

## Step 5: Update Service

**File**: `src/UniverSysLite.Application/Services/StudentService.cs`

```csharp
public async Task UpdateStudentAsync(Guid id, UpdateStudentDto dto)
{
    var student = await _repository.GetByIdAsync(id)
        ?? throw new StudentNotFoundException(id);
    
    student.UpdateName(dto.FirstName, dto.LastName);
    student.UpdatePreferredName(dto.PreferredFirstName);  // ADD THIS
    student.UpdateEmail(dto.Email);
    
    await _repository.UpdateAsync(student);
}
```

---

## Step 6: Update UI

**File**: `src/UniverSysLite.Web/Pages/Students/Edit.razor`

```razor
<div class="form-group">
    <label for="preferredName">Preferred First Name</label>
    <InputText id="preferredName" 
               @bind-Value="model.PreferredFirstName" 
               class="form-control" 
               placeholder="Leave blank to use legal name" />
    <small class="text-muted">
        This name will be displayed instead of your legal first name
    </small>
</div>
```

**File**: `src/UniverSysLite.Web/Pages/Students/List.razor`

```razor
@* Change from FirstName to DisplayName *@
<td>@student.DisplayName</td>
```

---

## Step 7: Write Tests

**File**: `tests/UniverSysLite.UnitTests/StudentTests.cs`

```csharp
public class StudentTests
{
    [Fact]
    public void DisplayFirstName_WhenPreferredNameSet_ReturnsPreferredName()
    {
        var student = new Student("John", "Doe", "john@test.edu");
        student.UpdatePreferredName("Johnny");
        
        Assert.Equal("Johnny", student.DisplayFirstName);
    }
    
    [Fact]
    public void DisplayFirstName_WhenPreferredNameNull_ReturnsLegalName()
    {
        var student = new Student("John", "Doe", "john@test.edu");
        
        Assert.Equal("John", student.DisplayFirstName);
    }
    
    [Fact]
    public void UpdatePreferredName_SetsTimestamp()
    {
        var student = new Student("John", "Doe", "john@test.edu");
        var before = DateTime.UtcNow;
        
        student.UpdatePreferredName("Johnny");
        
        Assert.NotNull(student.PreferredNameUpdatedAt);
        Assert.True(student.PreferredNameUpdatedAt >= before);
    }
}
```

Run tests:
```bash
dotnet test
```

---

## Step 8: Update Documentation

**File**: `docs/architecture/DATABASE_SCHEMA.md`

Add to Students table:
```
| PreferredFirstName | varchar(50) | null | Preferred display name |
| PreferredNameUpdatedAt | datetime | null | When preferred name was last changed |
```

---

## Step 9: Create Pull Request

Commit message format:
```
feat(students): add preferred name support

- Add PreferredFirstName field to Student entity
- Update DTOs and mappings
- Update UI to show display name
- Add unit tests for display name logic

Closes #42
```

---

## ✅ Checklist

- [ ] Domain entity updated
- [ ] Migration created and applied
- [ ] DTOs updated
- [ ] Mapping updated
- [ ] Service updated
- [ ] UI updated
- [ ] Unit tests written
- [ ] Integration test updated
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] PR created with good description
```

---

# 🚀 EXECUTION INSTRUCTIONS

## For Claude Code:

1. **Start with documentation structure** - Create all `/docs` folders and template files first

2. **Build Sprint 1 completely** including:
   - All code deliverables
   - SPRINT_1.md with daily logs
   - Architecture decision records
   - Initial onboarding docs

3. **For each subsequent sprint**:
   - Start with sprint planning document
   - Log progress daily
   - Complete sprint retrospective
   - Update all relevant documentation

4. **Generate demo data** that tells a story:
   - 50 students across different programs
   - 20 courses with prerequisites
   - 30 sections with realistic schedules
   - 200 enrollments
   - Sample grades and billing

5. **Final deliverables**:
   - Complete, working application
   - All sprint documentation
   - User guides for each role
   - Technical documentation
   - Training materials
   - README with screenshots

---

# 📊 SUCCESS METRICS

## Code Quality
- [ ] All features working
- [ ] 70%+ test coverage on services
- [ ] No critical bugs
- [ ] Clean, consistent code

## Documentation Quality
- [ ] Every sprint fully documented
- [ ] All ADRs written
- [ ] User guides complete
- [ ] Technical docs accurate
- [ ] Onboarding tested (someone could follow it)

## Portfolio Impact
- [ ] Demonstrates planning ability
- [ ] Shows execution discipline
- [ ] Proves documentation skills
- [ ] Highlights mentoring mindset
- [ ] Professional presentation

---

**This project proves you can not only BUILD software, but DELIVER it professionally.** 🎓

