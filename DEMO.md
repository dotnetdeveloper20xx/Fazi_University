# UniverSys Lite - Demo Guide

## Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- SQL Server (LocalDB or full instance)

### Starting the Application

1. **Start Backend API:**
   ```bash
   cd src/Presentation/UniverSysLite.API
   dotnet run
   ```
   API runs at: http://localhost:5275
   Swagger UI: http://localhost:5275/swagger

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install  # first time only
   npm start
   ```
   Frontend runs at: http://localhost:4201

---

## Test Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Administrator** | admin@universyslite.edu | Admin@123! | Full system access |
| **Faculty** | john.smith@universyslite.edu | Faculty@123! | Courses, grades, students (view) |
| **Registrar** | mary.wilson@universyslite.edu | Staff@123! | Students, enrollments, courses |
| **Billing Staff** | robert.walker@universyslite.edu | Staff@123! | Billing, payments, student accounts |
| **Student** | *See note below* | Student@123! | Own grades, billing, enrollments |

> **Note:** Student accounts are generated with random names during seeding. To find actual student emails:
> 1. Login as Admin
> 2. Go to Students page
> 3. Pick any student email (format: firstname.lastnameN@student.universyslite.edu)
> 4. Use password: `Student@123!`

### Additional Test Accounts

**More Faculty (all use password: Faculty@123!):**
- emily.johnson@universyslite.edu
- michael.williams@universyslite.edu
- sarah.brown@universyslite.edu
- david.jones@universyslite.edu

**More Registrar Staff (all use password: Staff@123!):**
- james.clark@universyslite.edu
- patricia.lewis@universyslite.edu

**More Billing Staff (all use password: Staff@123!):**
- jennifer.hall@universyslite.edu
- michael.allen@universyslite.edu

---

## Feature Demonstrations

### 1. Authentication & Authorization

**Demo Steps:**
1. Navigate to http://localhost:4201
2. Login with admin@universyslite.edu / Admin@123!
3. Notice all menu items are visible (full access)
4. Logout and login as john.smith@universyslite.edu / Faculty@123!
5. Notice reduced menu items (role-based access control)

**Features to Highlight:**
- JWT-based authentication with refresh tokens
- Role-based menu visibility
- Permission-based actions
- Secure password handling

---

### 2. Student Management

**Demo as Registrar (mary.wilson@universyslite.edu / Staff@123!):**

1. **View Student List:**
   - Navigate to Students
   - Show pagination (150 students seeded)
   - Use search to filter by name
   - Filter by status (Active, On Leave, Graduated)
   - Filter by program

2. **View Student Details:**
   - Click on any student
   - Show personal information
   - Show academic information (GPA, credits, standing)
   - Show enrollment history
   - Show billing status

3. **Create New Student:**
   - Click "Add Student" button
   - Fill in personal details
   - Assign to program
   - Save and show success notification

4. **Edit Student:**
   - Select existing student
   - Modify information
   - Save changes

**Data to Show:**
- 150 students across various programs
- GPA ranges from 1.5 to 4.0
- Academic standings: Good Standing, Warning, Probation
- Financial holds on ~10% of students

---

### 3. Course Management

**Demo as Administrator or Registrar:**

1. **View Course Catalog:**
   - Navigate to Courses
   - Show 70+ courses across 10 departments
   - Filter by department
   - Filter by level (Undergraduate/Graduate)

2. **Course Details:**
   - Click any course
   - Show course sections for current term
   - Show instructor assignments
   - Show enrollment counts

3. **Departments Available:**
   - Computer Science (CS)
   - Mathematics (MATH)
   - Physics (PHYS)
   - Chemistry (CHEM)
   - Biology (BIO)
   - English (ENG)
   - History (HIST)
   - Business (BUS)
   - Economics (ECON)
   - Psychology (PSY)

---

### 4. Enrollment Management

**Demo as Registrar:**

1. **View Enrollments:**
   - Navigate to Enrollments
   - Show current term enrollments
   - Filter by student, course, or status

2. **Enrollment Statuses:**
   - Enrolled (current term)
   - Completed (past terms with grades)
   - Withdrawn
   - Waitlisted

3. **Process Enrollment:**
   - Select student
   - View available sections
   - Enroll in course
   - Show enrollment confirmation

---

### 5. Grade Management

**Demo as Faculty (john.smith@universyslite.edu / Faculty@123!):**

1. **View Assigned Courses:**
   - Navigate to Grades
   - See courses assigned to instructor
   - Select a course section

2. **Enter Grades:**
   - View enrolled students
   - Enter/modify grades
   - Save grades

3. **Grade Distribution:**
   - A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F, W
   - GPA calculation shown

**Demo as Student:**
- Login as student
- Navigate to Grades
- View own grades and GPA
- View transcript

---

### 6. Billing & Payments

**Demo as Billing Staff (robert.walker@universyslite.edu / Staff@123!):**

1. **View Student Accounts:**
   - Navigate to Billing
   - Select a student from the dropdown
   - See detailed account information:
     - Account balance and status
     - Financial hold indicator
     - Recent charges (tuition, fees)
     - Payment history

2. **Billing Details (auto-generated from enrollments):**
   - **Tuition Charges:** Per course based on credit hours × tuition rate
   - **Registration Fee:** $150 per term
   - **Technology Fee:** $200 per term
   - **Student Activity Fee:** $75 per term

3. **Payment History:**
   - Payment methods: Credit Card, Bank Transfer, Financial Aid, Scholarship, Check
   - Reference numbers for each payment
   - Payment dates and amounts

4. **Tuition Calculator:**
   - Select student and term
   - View tuition breakdown by course
   - See total credits and amount due

5. **Financial Holds:**
   - ~10% of students have financial holds
   - Show hold impact on registration

**Demo as Student:**
- View own billing statement
- See account balance
- View payment history

---

### 7. Scheduling & Room Management

**Demo as Administrator:**

1. **View Buildings:**
   - 8 buildings seeded
   - Science, Engineering, Library, Business, etc.

2. **View Rooms:**
   - ~80 rooms across buildings
   - Room types: Classroom, Lab, Computer Lab, Auditorium, Conference Room

3. **Room Bookings:**
   - View calendar of bookings
   - Filter by building/room
   - See class schedules and meetings

---

### 8. Document Management

**Demo as Registrar or Student:**

1. **View Documents:**
   - Navigate to Documents
   - See uploaded documents

2. **Document Types:**
   - Transcripts
   - Forms
   - Policies
   - Student uploads

---

### 9. Notifications

**Demo as any user:**

1. **View Notifications:**
   - Click notification bell in header
   - See unread/read notifications

2. **Notification Types:**
   - Grade posted
   - Registration reminders
   - Financial holds
   - System alerts

---

### 10. Dashboard

**Each role sees different dashboard content:**

- **Administrator:** System overview, all statistics
- **Faculty:** Assigned courses, pending grades
- **Registrar:** Student statistics, enrollment counts
- **Billing Staff:** Outstanding balances, recent payments
- **Student:** Current courses, upcoming deadlines, balance

---

## API Endpoints (Swagger)

Access Swagger UI at: http://localhost:5275/swagger

### Key Endpoints:

**Authentication:**
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh-token
- POST /api/auth/change-password

**Students:**
- GET /api/students (paginated list)
- GET /api/students/{id}
- POST /api/students
- PUT /api/students/{id}
- DELETE /api/students/{id}

**Courses:**
- GET /api/courses
- GET /api/courses/{id}
- GET /api/courses/{id}/sections

**Enrollments:**
- GET /api/enrollments
- POST /api/enrollments
- PUT /api/enrollments/{id}

**Grades:**
- GET /api/grades/student/{studentId}
- POST /api/grades
- PUT /api/grades/{id}

---

## Database Information

**Seeded Data:**
- 1 Administrator
- 20 Faculty members
- 7 Staff (Registrar, Billing, Auditor)
- 150 Students
- 10 Departments
- 17 Programs
- 69 Courses
- 8 Academic Terms (past, current, future)
- 1,075 Course Sections
- 4,400+ Enrollments with grades
- 8 Buildings, 80+ Rooms
- Room Bookings
- Notifications
- Billing data (auto-generated from enrollments)

---

## Architecture Highlights

### Backend (.NET 8)
- Clean Architecture / Onion Architecture
- CQRS with MediatR
- Entity Framework Core with SQL Server
- ASP.NET Core Identity for authentication
- JWT tokens with refresh token support
- Serilog for structured logging
- Global exception handling

### Frontend (Angular 19)
- Standalone components
- Signals for reactive state management
- Angular Material 19
- Tailwind CSS
- Lazy-loaded feature modules
- Route guards for authentication
- HTTP interceptors for auth tokens

---

## Common Demo Scenarios

### Scenario 1: New Student Registration
1. Login as Registrar
2. Create new student
3. Assign to program
4. Enroll in courses
5. Show enrollment confirmation

### Scenario 2: Grade Submission
1. Login as Faculty
2. Navigate to assigned course
3. Enter grades for students
4. Finalize grades
5. Student can view in their portal

### Scenario 3: Payment Processing
1. Login as Billing Staff
2. Find student with balance
3. Process payment
4. Clear financial hold
5. Student can now register

### Scenario 4: Course Registration
1. Login as Student
2. View available courses
3. Check prerequisites
4. Enroll in course
5. Confirm enrollment

---

## UI Features

### Form Fields & Dropdowns
- Angular Material 19 styled form fields
- Proper label alignment with prefix icons (email, lock icons on login)
- Dropdown selects with custom triggers showing formatted values
- Date pickers using Angular Material datepicker component
- Responsive form field widths
- Placeholder text for filter fields

### Styling
- Tailwind CSS for utility-based styling
- Custom Angular Material theme with blue primary color
- Consistent card, table, and button styling
- Scrollbar customization
- Dark mode support (toggle in settings)

---

## Troubleshooting

**Login not working:**
- Ensure backend API is running at http://localhost:5275
- Check CORS is configured for http://localhost:4201
- Clear browser localStorage and try again

**Database issues:**
- Run migrations: `dotnet ef database update`
- Re-seed: Stop API, delete database, restart API

**Frontend issues:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Hard refresh browser: Ctrl+Shift+R

---

## Contact

For questions or issues, please contact the development team.
