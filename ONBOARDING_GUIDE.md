# UniverSys Lite - New User Onboarding Guide

## Welcome to UniverSys Lite!

### What This Application Does

UniverSys Lite is a comprehensive University Management System designed to streamline academic administration. It handles student records, course management, class scheduling, enrollment processing, grade tracking, billing, and document management - everything a university needs to manage its academic operations efficiently.

### What You'll Be Able to Do

After completing this guide, you'll confidently:
- Navigate the system and understand the role-based permissions
- Manage student records from admission through graduation
- Create and schedule courses with proper room assignments
- Process enrollments and manage waitlists
- Submit and finalize grades for students
- Handle student billing, charges, and payments
- Upload and verify student documents
- Use the notification system to communicate with users

---

## Technology Stack Detected

### Backend
- **Framework:** ASP.NET Core 8.0 Web API
- **Language:** C# with .NET 8.0
- **ORM/Data Access:** Entity Framework Core 8.0 (Code First)
- **Authentication:** JWT Bearer Tokens with ASP.NET Core Identity
- **API Style:** REST API with CQRS pattern (MediatR)

### Frontend
- **Framework:** Angular 19.2
- **Language:** TypeScript 5.7
- **State Management:** RxJS Signals and Services
- **UI Library:** Angular Material 19.2 + Tailwind CSS 3.4
- **Form Handling:** Angular Reactive Forms
- **Routing:** Angular Router with Lazy Loading

### Database
- **Type:** SQL Server (LocalDB for development)
- **Access Pattern:** Entity Framework Core Code First with Migrations

### Project Structure
- **Monorepo:** Yes
- **Backend Location:** `/src/Presentation/UniverSysLite.API/`
- **Frontend Location:** `/frontend/`

---

## Part 1: Getting Started

### Logging In

1. Open your web browser and navigate to `http://localhost:4201`
2. You'll see the login screen with the UniverSys Lite branding
3. Enter your credentials:
   - **Email:** Your university email address
   - **Password:** Your assigned password
4. Click **Sign In**
5. If successful, you'll be redirected to the Dashboard

**Demo Accounts Available:**
| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@universyslite.edu | Admin@123! |
| Faculty | faculty@universyslite.edu | Faculty@123! |
| Registrar | registrar@universyslite.edu | Registrar@123! |
| Billing Staff | billing@universyslite.edu | Billing@123! |
| Student | student@universyslite.edu | Student@123! |

### The Main Screen: Your Home Base

After logging in, you'll see the main application layout:

```
+------------------+----------------------------------------+
|                  |         Header (User Menu)             |
|                  +----------------------------------------+
|                  |                                        |
|    Sidebar       |          Main Content Area             |
|    Navigation    |                                        |
|                  |          (Dashboard/Features)          |
|                  |                                        |
|                  |                                        |
|                  +----------------------------------------+
|    [Collapse]    |              Footer                    |
+------------------+----------------------------------------+
```

- **Sidebar:** Navigation menu (can be collapsed for more space)
- **Header:** Shows your name, notifications bell, and logout option
- **Main Content:** Where all feature screens are displayed

### Navigation Menu

The sidebar shows menu items based on your role permissions:

| Menu Item | Icon | Where It Goes | Who Can Access |
|-----------|------|---------------|----------------|
| Dashboard | dashboard | /dashboard | Everyone |
| Students | school | /students | Administrator, Registrar, Faculty |
| Courses | menu_book | /courses | Administrator, Registrar, Faculty |
| Enrollments | assignment | /enrollments | Administrator, Registrar, Student |
| Grades | grade | /grades | Administrator, Faculty, Student |
| Billing | payments | /billing | Administrator, BillingStaff, Student |
| Scheduling | event | /scheduling | Administrator, Registrar, Faculty |
| Documents | folder | /documents | Administrator, Registrar, Student |
| Notifications | notifications | /notifications | Everyone |
| Settings | settings | /settings | Everyone |

---

## Part 2: Practice Environment Setup

### Understanding the Data Model

Before working with the system, understand these key concepts:

**Academic Hierarchy:**
```
Department (e.g., "Computer Science")
    └── Program (e.g., "BS Computer Science")
        └── Courses (e.g., "CS101 - Introduction to Programming")
            └── Course Sections (e.g., "Section 001 - Fall 2026")
                └── Enrollments (Student + Section + Grade)
```

**Student Lifecycle:**
```
Applicant → Admitted → Active → [On Leave/Suspended] → Graduated/Withdrawn
```

### Seed Data Script (SQL Server)

Run this script to populate your database with training data:

```sql
-- =====================================================
-- SEED DATA FOR UniverSys Lite
-- Database: SQL Server (LocalDB)
-- Generated for: Onboarding Training
-- =====================================================

-- Note: Run migrations first to create the schema
-- Then use this data for practice scenarios

-- Clear previous seed data (safe to re-run)
DELETE FROM StudentDocuments WHERE Student.Email LIKE '%@example.com';
DELETE FROM Enrollments WHERE Student.Email LIKE '%@example.com';
DELETE FROM Students WHERE Email LIKE '%@example.com';
DELETE FROM CourseSections WHERE SectionNumber LIKE 'SEED%';
DELETE FROM Courses WHERE Code LIKE 'DEMO%';
DELETE FROM Programs WHERE Code LIKE 'DEMO%';
DELETE FROM Departments WHERE Code LIKE 'DEMO%';

-- ===== DEPARTMENTS =====
INSERT INTO Departments (Id, Code, Name, Description, IsActive, CreatedAt)
VALUES
    (NEWID(), 'DEMO-CS', 'Computer Science (Demo)', 'Training department for CS', 1, GETUTCDATE()),
    (NEWID(), 'DEMO-BUS', 'Business Administration (Demo)', 'Training department for Business', 1, GETUTCDATE()),
    (NEWID(), 'DEMO-ENG', 'Engineering (Demo)', 'Training department for Engineering', 1, GETUTCDATE());

-- ===== PROGRAMS =====
-- (Insert programs linked to departments above)

-- ===== COURSES =====
-- (Insert courses linked to departments)

-- ===== TERMS =====
INSERT INTO Terms (Id, Code, Name, Type, AcademicYear, StartDate, EndDate,
    RegistrationStartDate, RegistrationEndDate, AddDropDeadline, WithdrawalDeadline,
    GradesDeadline, IsCurrent, IsActive, CreatedAt)
VALUES
    (NEWID(), '2026-SPRING', 'Spring 2026', 1, 2026, '2026-01-15', '2026-05-15',
     '2025-11-01', '2026-01-10', '2026-01-29', '2026-03-15', '2026-05-22', 1, 1, GETUTCDATE()),
    (NEWID(), '2026-FALL', 'Fall 2026', 0, 2026, '2026-08-25', '2026-12-15',
     '2026-04-01', '2026-08-20', '2026-09-08', '2026-10-15', '2026-12-22', 0, 1, GETUTCDATE());

-- ===== BUILDINGS =====
INSERT INTO Buildings (Id, Code, Name, Address, TotalFloors, IsActive, CreatedAt)
VALUES
    (NEWID(), 'MAIN', 'Main Building', '100 University Ave', 4, 1, GETUTCDATE()),
    (NEWID(), 'SCI', 'Science Building', '200 University Ave', 3, 1, GETUTCDATE()),
    (NEWID(), 'LIB', 'Library', '150 University Ave', 2, 1, GETUTCDATE());

-- ===== ROOMS =====
-- (Insert rooms linked to buildings)

-- Verification Query
SELECT 'Departments' as TableName, COUNT(*) as SeedRecords FROM Departments WHERE Code LIKE 'DEMO%'
UNION ALL
SELECT 'Terms', COUNT(*) FROM Terms WHERE Code LIKE '2026%'
UNION ALL
SELECT 'Buildings', COUNT(*) FROM Buildings WHERE Code IN ('MAIN', 'SCI', 'LIB');
```

---

## Part 3: Feature-by-Feature Guide

### Chapter 1: Students

#### What This Feature Is For
Manage the complete student lifecycle - from application/admission through graduation. Track academic progress, holds, and GPA.

#### Getting There
Click **Students** in the sidebar navigation.

#### The Screen Layout

```
+------------------------------------------------------------------+
|  Students                               [+ Add Student] [Export] |
+------------------------------------------------------------------+
| Search: [________________]  Status: [All ▼]  Type: [All ▼]       |
| Standing: [All ▼]                            [Clear Filters]     |
+------------------------------------------------------------------+
| ID       | Name        | Program    | GPA  | Status | Standing   |
|----------|-------------|------------|------|--------|------------|
| STU-2026 | John Smith  | BS CompSci | 3.45 | Active | Good       |
| STU-2026 | Jane Doe    | MBA        | 3.78 | Active | Dean's     |
+------------------------------------------------------------------+
|                    < 1 2 3 ... 10 >     Items per page: [10 ▼]   |
+------------------------------------------------------------------+
```

#### Toolbar/Action Buttons

| Button | What It Does | When to Use |
|--------|--------------|-------------|
| + Add Student | Opens form to create new student | When admitting a new student |
| Export | Downloads student list | For reports or data analysis |
| Clear Filters | Resets all search filters | Start fresh search |

#### Form Fields (Add/Edit Student)

| Field | What to Enter | Rules | Example |
|-------|---------------|-------|---------|
| First Name | Student's legal first name | Required, max 100 chars | John |
| Middle Name | Middle name if any | Optional | Michael |
| Last Name | Student's legal last name | Required, max 100 chars | Smith |
| Email | University email | Required, valid email | john.smith@university.edu |
| Personal Email | Personal email | Optional, valid email | john@gmail.com |
| Date of Birth | Birth date | Required, must be past date | 01/15/2000 |
| Gender | Select gender | Required | Male/Female/Other/Prefer Not to Say |
| Phone | Contact phone | Optional | (555) 123-4567 |
| Status | Enrollment status | Required | Applicant/Admitted/Active/etc. |
| Type | Student type | Required | Full Time/Part Time/Online |
| Program | Degree program | Optional (can assign later) | BS Computer Science |
| Department | Academic department | Auto-filled from program | Computer Science |

#### Dropdown Options

**Status:**
| Option | When to Use |
|--------|-------------|
| Applicant | Just applied, not yet admitted |
| Admitted | Accepted but not enrolled in classes |
| Active | Currently taking classes |
| On Leave | Temporary absence (approved) |
| Suspended | Academic or disciplinary suspension |
| Withdrawn | Left the university |
| Dismissed | Academically dismissed |
| Graduated | Completed degree requirements |

**Student Type:**
| Option | When to Use |
|--------|-------------|
| Full Time | 12+ credit hours per semester |
| Part Time | Less than 12 credit hours |
| Online | Distance learning only |
| Exchange | Visiting from partner institution |
| Visiting | Non-degree seeking |
| Non-Degree | Taking courses without degree goal |

**Academic Standing:**
| Option | Meaning |
|--------|---------|
| Good Standing | GPA above 2.0, no issues |
| Academic Warning | GPA dropped, first warning |
| Academic Probation | Continued low performance |
| Academic Suspension | Suspended for grades |
| Dean's List | GPA 3.5-3.79 |
| President's List | GPA 3.8+ |

#### Search and Filters
- **Search box:** Type student ID, name, or email
- **Status filter:** Filter by enrollment status
- **Type filter:** Filter by full-time, part-time, etc.
- **Standing filter:** Filter by academic standing

#### Practice Exercise
1. Click **+ Add Student**
2. Enter: First Name: "Practice", Last Name: "Student", Email: "practice@example.com"
3. Set Status to "Active" and Type to "Full Time"
4. Click **Save**
5. Find your new student using the search box

---

### Chapter 2: Courses

#### What This Feature Is For
Create and manage the course catalog. Define credit hours, levels, and prerequisites.

#### Getting There
Click **Courses** in the sidebar navigation.

#### The Screen Layout

```
+------------------------------------------------------------------+
|  Courses                                       [+ Add Course]     |
+------------------------------------------------------------------+
| Search: [________________]  Level: [All ▼]  Status: [All ▼]      |
+------------------------------------------------------------------+
| Code    | Name                  | Dept | Credits | Level | Sections|
|---------|------------------------|------|---------|-------|---------|
| CS101   | Intro to Programming   | CS   | 3       | Undergrad | 4  |
| CS201   | Data Structures        | CS   | 3       | Undergrad | 2  |
| MBA510  | Business Strategy      | BUS  | 3       | Graduate  | 1  |
+------------------------------------------------------------------+
```

#### Form Fields (Add/Edit Course)

| Field | What to Enter | Rules | Example |
|-------|---------------|-------|---------|
| Code | Course code | Required, unique | CS101 |
| Name | Course title | Required | Introduction to Programming |
| Description | Course description | Optional | Learn fundamentals of coding... |
| Department | Owning department | Required | Computer Science |
| Credit Hours | Academic credits | Required, 1-6 | 3 |
| Lecture Hours | Weekly lecture time | Required | 3 |
| Lab Hours | Weekly lab time | Optional | 0 |
| Level | Academic level | Required | Undergraduate/Graduate |
| Active | Is course available | Toggle | Yes |

#### Dropdown Options

**Course Level:**
| Option | When to Use |
|--------|-------------|
| Undergraduate | 100-400 level courses |
| Graduate | 500-700 level courses |
| Doctoral | 800+ level courses |
| Professional | Professional certifications |

---

### Chapter 3: Enrollments

#### What This Feature Is For
Enroll students in course sections, manage waitlists, and process drops/withdrawals.

#### Getting There
Click **Enrollments** in the sidebar navigation.

#### The Screen Layout

```
+------------------------------------------------------------------+
|  Enrollments                                [+ Enroll Student]    |
+------------------------------------------------------------------+
| Search: [___________]  Status: [All ▼]  Grade: [All ▼]           |
+------------------------------------------------------------------+
| Student      | Course | Section | Term    | Date    | Status | Grade |
|--------------|--------|---------|---------|---------|--------|-------|
| John Smith   | CS101  | 001     | Spr2026 | 01/15   | Enrolled | --  |
| Jane Doe     | CS101  | 001     | Spr2026 | 01/16   | Completed | A  |
+------------------------------------------------------------------+
```

#### Enrollment Actions

| Action | What It Does | When to Use |
|--------|--------------|-------------|
| Drop | Remove before deadline | Student changes mind early |
| Withdraw | Remove after deadline | Student needs to leave course, gets "W" |

**Important Deadlines:**
- **Add/Drop Deadline:** Last day to drop without penalty
- **Withdrawal Deadline:** Last day to withdraw with "W" grade

#### Form Fields (Enroll Student)

| Field | What to Enter | Rules | Example |
|-------|---------------|-------|---------|
| Student | Select student | Required | John Smith (STU-2026-00001) |
| Course Section | Select open section | Required | CS101-001 (Spring 2026) |

---

### Chapter 4: Grades

#### What This Feature Is For
Faculty submit and finalize grades. View transcripts and GPA calculations.

#### Getting There
Click **Grades** in the sidebar navigation.

#### The Screen Layout

```
+------------------------------------------------------------------+
|  Grade Entry                              [Finalize All Grades]   |
+------------------------------------------------------------------+
| Course Section: [CS101-001 - Spring 2026 ▼]                       |
+------------------------------------------------------------------+
| ID         | Student     | Status    | Attend | Grade | Actions   |
|------------|-------------|-----------|--------|-------|-----------|
| STU-2026-1 | John Smith  | Enrolled  | 95%    | [A ▼] | [Save]   |
| STU-2026-2 | Jane Doe    | Enrolled  | 88%    | [B ▼] | [Save]   |
+------------------------------------------------------------------+
```

#### Grade Values

| Letter Grade | Grade Points | Numeric Range |
|--------------|--------------|---------------|
| A | 4.0 | 90-100 |
| B | 3.0 | 80-89 |
| C | 2.0 | 70-79 |
| D | 1.0 | 60-69 |
| F | 0.0 | 0-59 |
| W | -- | Withdrawal |
| I | -- | Incomplete |
| P | -- | Pass (Pass/Fail courses) |
| NP | -- | No Pass |

#### Grade Entry Process
1. Select a course section from the dropdown
2. See all enrolled students
3. For each student, select letter grade or enter numeric grade
4. Click **Save** next to each row OR
5. Click **Finalize All Grades** to lock all grades

**Warning:** Once finalized, grades cannot be changed without administrator override!

---

### Chapter 5: Billing

#### What This Feature Is For
View student accounts, add charges (tuition, fees), and process payments.

#### Getting There
Click **Billing** in the sidebar navigation.

#### The Screen Layout

```
+------------------------------------------------------------------+
|  Billing Overview                                                 |
+------------------------------------------------------------------+
| Student: [John Smith - STU-2026-00001 ▼]                          |
+------------------------------------------------------------------+
| +----------------+  +----------------+  +------------------+      |
| | Balance        |  | Account Status |  | Financial Hold   |      |
| | $5,250.00      |  | Active         |  | No               |      |
| +----------------+  +----------------+  +------------------+      |
+------------------------------------------------------------------+
| Recent Charges                           | Recent Payments        |
| Date    | Description      | Amount      | Date   | Method | Amt  |
| 01/15   | Spring Tuition   | $4,500.00   | 01/20  | Card   | $2k  |
| 01/15   | Technology Fee   | $750.00     |        |        |      |
+------------------------------------------------------------------+
|                     [Add Charge]  [Process Payment]               |
+------------------------------------------------------------------+
```

#### Charge Types

| Type | Description |
|------|-------------|
| Tuition | Course credit charges |
| Technology Fee | Computer/lab access |
| Lab Fee | Science/engineering labs |
| Parking | Campus parking permit |
| Housing | Dormitory charges |
| Meal Plan | Cafeteria access |
| Late Payment Fee | Penalty for late payment |
| Library Fine | Overdue book charges |

#### Payment Methods

| Method | Description |
|--------|-------------|
| Credit Card | Visa, MasterCard, etc. |
| Debit Card | Bank card payment |
| Check | Paper check |
| Cash | In-person cash payment |
| Wire Transfer | Bank wire |
| Financial Aid | Aid disbursement |
| Scholarship | Scholarship applied |
| Payment Plan | Installment payment |

---

### Chapter 6: Scheduling

#### What This Feature Is For
Manage buildings, rooms, and room bookings for classes and events.

#### Getting There
Click **Scheduling** in the sidebar navigation.

#### Tabs Available

1. **Rooms Tab:** Manage classroom inventory
2. **Buildings Tab:** Manage campus buildings
3. **Calendar Tab:** Book rooms for events

#### Room Types

| Type | Use For |
|------|---------|
| Classroom | Standard lectures (20-40 students) |
| Lecture Hall | Large lectures (100+ students) |
| Laboratory | Science experiments |
| Computer Lab | Programming courses |
| Conference Room | Meetings |
| Seminar | Small group discussions |
| Auditorium | Events, assemblies |

#### Room Features (Icons)

| Icon | Meaning |
|------|---------|
| Projector icon | Room has projector |
| Whiteboard icon | Room has whiteboard |
| Computer icon | Room has computers |
| Wheelchair icon | Wheelchair accessible |

---

### Chapter 7: Documents

#### What This Feature Is For
Upload, store, and verify student documents (transcripts, IDs, financial aid papers).

#### Getting There
Click **Documents** in the sidebar navigation.

#### Document Types

| Type | When to Upload |
|------|----------------|
| Transcript | Academic records from previous schools |
| Degree Audit | Current degree progress report |
| Admission Letter | Official admission correspondence |
| Identification | Student ID, driver's license |
| Passport | For international students |
| Visa | Immigration documents |
| Financial Aid Document | FAFSA, aid letters |
| Scholarship Letter | Scholarship awards |
| Medical Record | Health forms |
| Immunization Record | Vaccination proof |
| Insurance Document | Health insurance |

#### Upload Process
1. Select a student from the dropdown
2. Click **Upload Document**
3. Fill in document name and type
4. (Optional) Add description and expiration date
5. Select the file from your computer
6. Click **Upload**

#### Verification
- Administrators can mark documents as "Verified"
- Verified documents show a green checkmark
- Expired documents show a warning indicator

---

## Part 4: Complete Case Study

### Meet Maria Rodriguez

Maria is a new Registrar at UniverSys Lite University. It's the first week of the Spring 2026 semester, and she needs to:
1. Admit a new transfer student
2. Help the student enroll in courses
3. Verify the student's transcripts

### The Scenario

**Transfer Student:** Alex Chen
- Coming from Community College
- Wants to major in Computer Science
- Has completed 30 credits
- Needs to take 4 courses this semester

### Step-by-Step Walkthrough

#### Step 1: Create the Student Record

1. Log in as Registrar (registrar@universyslite.edu / Registrar@123!)
2. Navigate to **Students**
3. Click **+ Add Student**
4. Enter the following:
   - First Name: Alex
   - Last Name: Chen
   - Email: alex.chen@university.edu
   - Date of Birth: 03/15/2002
   - Gender: Male
   - Phone: (555) 234-5678
   - Status: **Admitted**
   - Type: **Full Time**
   - Program: BS Computer Science
5. Click **Save**
6. Note the generated Student ID (e.g., STU-2026-00015)

#### Step 2: Upload Transfer Transcripts

1. Navigate to **Documents**
2. Select "Alex Chen" from the student dropdown
3. Click **Upload Document**
4. Enter:
   - Name: "Community College Official Transcript"
   - Type: **Transcript**
   - Description: "Transfer credits - 30 credits completed"
5. Select the PDF file
6. Click **Upload**
7. After upload, click **Verify** to mark as verified

#### Step 3: Change Status to Active

1. Navigate to **Students**
2. Find Alex Chen in the list
3. Click the menu (three dots) → **Edit**
4. Change Status from "Admitted" to **Active**
5. Click **Save**

#### Step 4: Enroll in Courses

1. Navigate to **Enrollments**
2. Click **+ Enroll Student**
3. Select Student: Alex Chen
4. Select Course Section: CS201-001 (Data Structures - Spring 2026)
5. Click **Enroll**
6. Repeat for:
   - CS202-001 (Algorithms)
   - MATH201-002 (Calculus II)
   - ENG101-003 (English Composition)

#### Step 5: Verify Enrollment

1. In the Enrollments list, filter by searching "Alex Chen"
2. Confirm all 4 enrollments show status "Enrolled"
3. Navigate to **Students** → Find Alex → Click to view details
4. Verify course schedule is displayed

**Success!** Alex Chen is now fully enrolled for Spring 2026.

---

## Part 5: Quick Reference

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| / | Focus search box |
| Esc | Close modal/dialog |
| Enter | Submit form |

### Status Colors/Badges

**Student Status:**
| Status | Color |
|--------|-------|
| Active | Green |
| Admitted | Blue |
| On Leave | Yellow |
| Suspended | Orange |
| Withdrawn | Gray |
| Graduated | Purple |

**Enrollment Status:**
| Status | Color |
|--------|-------|
| Enrolled | Green |
| Waitlisted | Yellow |
| Completed | Blue |
| Dropped | Gray |
| Withdrawn | Orange |
| Failed | Red |

**Academic Standing:**
| Standing | Color |
|----------|-------|
| Good Standing | Green |
| Dean's List | Blue |
| President's List | Purple |
| Warning | Yellow |
| Probation | Orange |
| Suspension | Red |

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Email already exists" | Duplicate email | Use a different email address |
| "Section is full" | No seats available | Try different section or waitlist |
| "Prerequisites not met" | Missing required course | Complete prerequisite first |
| "Past add/drop deadline" | Too late to drop | Use Withdraw instead |
| "Financial hold" | Unpaid balance | Contact billing office |
| "Academic hold" | Academic issue | Contact advisor |

### Glossary

| Term | Definition |
|------|------------|
| **Credit Hour** | Unit measuring course workload (1 credit = 1 hour/week) |
| **GPA** | Grade Point Average (0.0 - 4.0 scale) |
| **Prerequisite** | Course required before taking another course |
| **Section** | A specific offering of a course (time/instructor) |
| **Term** | Academic period (Fall, Spring, Summer) |
| **Transcript** | Official record of courses and grades |
| **Waitlist** | Queue for full courses |
| **Hold** | Block preventing registration or graduation |

---

## Part 6: Getting Help

### System Support

For technical issues with UniverSys Lite:
- **Email:** support@universyslite.edu
- **Phone:** (555) 123-4567
- **Hours:** Monday-Friday, 8 AM - 5 PM

### Training Resources

- This onboarding guide
- Video tutorials (coming soon)
- Knowledge base articles

### Role-Specific Contacts

| Role | Contact |
|------|---------|
| Registration Issues | Registrar's Office |
| Billing Questions | Bursar's Office |
| Academic Advising | Department Advisor |
| Technical Support | IT Help Desk |

---

## Appendix A: User Roles and Permissions

| Permission | Admin | Registrar | Faculty | Billing | Student |
|------------|-------|-----------|---------|---------|---------|
| View Students | Yes | Yes | Yes | No | Own Only |
| Create Students | Yes | Yes | No | No | No |
| Edit Students | Yes | Yes | No | No | No |
| Delete Students | Yes | Yes | No | No | No |
| View Courses | Yes | Yes | Yes | No | Yes |
| Create Courses | Yes | Yes | No | No | No |
| Edit Courses | Yes | Yes | No | No | No |
| View Enrollments | Yes | Yes | Own | No | Own |
| Create Enrollments | Yes | Yes | No | No | Own |
| View Grades | Yes | No | Own | No | Own |
| Edit Grades | Yes | No | Own | No | No |
| Finalize Grades | Yes | No | Own | No | No |
| View Billing | Yes | No | No | Yes | Own |
| Create Charges | Yes | No | No | Yes | No |
| Process Payments | Yes | No | No | Yes | No |
| View Documents | Yes | Yes | No | No | Own |
| Upload Documents | Yes | Yes | No | No | Own |
| Verify Documents | Yes | Yes | No | No | No |
| Manage Scheduling | Yes | Yes | Yes | No | No |
| Send Notifications | Yes | Yes | Yes | Yes | No |
| Manage Users | Yes | No | No | No | No |
| View Reports | Yes | Yes | No | Yes | No |

---

## Appendix B: API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Authenticate user |
| POST | /api/auth/register | Register new user |
| POST | /api/auth/refresh-token | Refresh access token |
| GET | /api/auth/me | Get current user info |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/students | List students (paginated) |
| GET | /api/students/{id} | Get student details |
| POST | /api/students | Create student |
| PUT | /api/students/{id} | Update student |
| DELETE | /api/students/{id} | Delete student |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/courses | List courses |
| GET | /api/courses/{id} | Get course details |
| POST | /api/courses | Create course |
| PUT | /api/courses/{id} | Update course |
| DELETE | /api/courses/{id} | Delete course |

### Enrollments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/enrollments | List enrollments |
| POST | /api/enrollments | Enroll student |
| POST | /api/enrollments/{id}/drop | Drop enrollment |
| POST | /api/enrollments/{id}/withdraw | Withdraw enrollment |

### Grades
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/grades | Submit grade |
| POST | /api/grades/section/{id}/finalize | Finalize section grades |
| GET | /api/grades/student/{id}/transcript | Get transcript |
| GET | /api/grades/student/{id}/gpa | Get GPA summary |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/billing/student/{id} | Get account info |
| POST | /api/billing/charge | Add charge |
| POST | /api/billing/payment | Process payment |

### Scheduling
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/scheduling/buildings | List buildings |
| GET | /api/scheduling/rooms | List rooms |
| POST | /api/scheduling/bookings | Book room |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/documents/student/{id} | List student documents |
| POST | /api/documents/student/{id} | Upload document |
| PUT | /api/documents/{id}/verify | Verify document |

---

*Document generated for UniverSys Lite University Management System*
*Last updated: January 2026*
