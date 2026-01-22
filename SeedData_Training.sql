-- =====================================================
-- SEED DATA FOR UniverSys Lite
-- Database: SQL Server (LocalDB)
-- Purpose: Onboarding Training Data
-- =====================================================
-- IMPORTANT: Run this after EF migrations have been applied
-- This script is safe to re-run (uses MERGE pattern)
-- All seed data uses @example.com emails for easy cleanup
-- =====================================================

USE [UniverSysLiteDb_Dev];
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
PRINT 'Starting UniverSys Lite Training Data Seed...';
PRINT '============================================';

-- =====================================================
-- SECTION 1: DEPARTMENTS
-- =====================================================
PRINT 'Seeding Departments...';

-- Computer Science Department
IF NOT EXISTS (SELECT 1 FROM Departments WHERE Code = 'CS')
BEGIN
    INSERT INTO Departments (Id, Code, Name, Description, Phone, Email, Location, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'A1111111-1111-1111-1111-111111111111',
        'CS',
        'Computer Science',
        'Department of Computer Science and Information Technology. Offers programs in software development, data science, and cybersecurity.',
        '(555) 100-1001',
        'cs@universyslite.example.com',
        'Science Building, Floor 3',
        1, 0, GETUTCDATE()
    );
    PRINT '  - Computer Science department created';
END

-- Business Administration Department
IF NOT EXISTS (SELECT 1 FROM Departments WHERE Code = 'BUS')
BEGIN
    INSERT INTO Departments (Id, Code, Name, Description, Phone, Email, Location, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'A2222222-2222-2222-2222-222222222222',
        'BUS',
        'Business Administration',
        'School of Business offering undergraduate and graduate programs in management, finance, and marketing.',
        '(555) 100-2002',
        'business@universyslite.example.com',
        'Main Building, Floor 2',
        1, 0, GETUTCDATE()
    );
    PRINT '  - Business Administration department created';
END

-- Engineering Department
IF NOT EXISTS (SELECT 1 FROM Departments WHERE Code = 'ENG')
BEGIN
    INSERT INTO Departments (Id, Code, Name, Description, Phone, Email, Location, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'A3333333-3333-3333-3333-333333333333',
        'ENG',
        'Engineering',
        'College of Engineering covering mechanical, electrical, and civil engineering disciplines.',
        '(555) 100-3003',
        'engineering@universyslite.example.com',
        'Engineering Building, Floor 1',
        1, 0, GETUTCDATE()
    );
    PRINT '  - Engineering department created';
END

-- Mathematics Department
IF NOT EXISTS (SELECT 1 FROM Departments WHERE Code = 'MATH')
BEGIN
    INSERT INTO Departments (Id, Code, Name, Description, Phone, Email, Location, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'A4444444-4444-4444-4444-444444444444',
        'MATH',
        'Mathematics',
        'Department of Mathematics and Statistics. Provides foundational courses for all STEM programs.',
        '(555) 100-4004',
        'math@universyslite.example.com',
        'Science Building, Floor 2',
        1, 0, GETUTCDATE()
    );
    PRINT '  - Mathematics department created';
END

-- English Department
IF NOT EXISTS (SELECT 1 FROM Departments WHERE Code = 'ENGL')
BEGIN
    INSERT INTO Departments (Id, Code, Name, Description, Phone, Email, Location, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'A5555555-5555-5555-5555-555555555555',
        'ENGL',
        'English and Communications',
        'Department of English, Literature, and Communications. Offers writing and communication courses.',
        '(555) 100-5005',
        'english@universyslite.example.com',
        'Arts Building, Floor 1',
        1, 0, GETUTCDATE()
    );
    PRINT '  - English department created';
END

-- =====================================================
-- SECTION 2: PROGRAMS
-- =====================================================
PRINT 'Seeding Programs...';

-- BS Computer Science
IF NOT EXISTS (SELECT 1 FROM Programs WHERE Code = 'BSCS')
BEGIN
    INSERT INTO Programs (Id, Code, Name, Description, DegreeType, DepartmentId, TotalCreditsRequired, DurationYears, TuitionPerCredit, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'B1111111-1111-1111-1111-111111111111',
        'BSCS',
        'Bachelor of Science in Computer Science',
        'Four-year program covering programming, algorithms, data structures, software engineering, and computer systems.',
        2, -- BachelorsDegree
        'A1111111-1111-1111-1111-111111111111', -- CS Department
        120, 4, 450.00,
        1, 0, GETUTCDATE()
    );
    PRINT '  - BS Computer Science program created';
END

-- MS Computer Science
IF NOT EXISTS (SELECT 1 FROM Programs WHERE Code = 'MSCS')
BEGIN
    INSERT INTO Programs (Id, Code, Name, Description, DegreeType, DepartmentId, TotalCreditsRequired, DurationYears, TuitionPerCredit, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'B2222222-2222-2222-2222-222222222222',
        'MSCS',
        'Master of Science in Computer Science',
        'Graduate program with specializations in AI, cybersecurity, and software engineering.',
        3, -- MastersDegree
        'A1111111-1111-1111-1111-111111111111', -- CS Department
        36, 2, 650.00,
        1, 0, GETUTCDATE()
    );
    PRINT '  - MS Computer Science program created';
END

-- BBA Business Administration
IF NOT EXISTS (SELECT 1 FROM Programs WHERE Code = 'BBA')
BEGIN
    INSERT INTO Programs (Id, Code, Name, Description, DegreeType, DepartmentId, TotalCreditsRequired, DurationYears, TuitionPerCredit, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'B3333333-3333-3333-3333-333333333333',
        'BBA',
        'Bachelor of Business Administration',
        'Comprehensive business program covering management, marketing, finance, and entrepreneurship.',
        2, -- BachelorsDegree
        'A2222222-2222-2222-2222-222222222222', -- BUS Department
        120, 4, 400.00,
        1, 0, GETUTCDATE()
    );
    PRINT '  - BBA program created';
END

-- MBA
IF NOT EXISTS (SELECT 1 FROM Programs WHERE Code = 'MBA')
BEGIN
    INSERT INTO Programs (Id, Code, Name, Description, DegreeType, DepartmentId, TotalCreditsRequired, DurationYears, TuitionPerCredit, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'B4444444-4444-4444-4444-444444444444',
        'MBA',
        'Master of Business Administration',
        'Professional graduate program for business leaders with concentrations in finance, marketing, and management.',
        3, -- MastersDegree
        'A2222222-2222-2222-2222-222222222222', -- BUS Department
        48, 2, 750.00,
        1, 0, GETUTCDATE()
    );
    PRINT '  - MBA program created';
END

-- BS Engineering
IF NOT EXISTS (SELECT 1 FROM Programs WHERE Code = 'BSE')
BEGIN
    INSERT INTO Programs (Id, Code, Name, Description, DegreeType, DepartmentId, TotalCreditsRequired, DurationYears, TuitionPerCredit, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'B5555555-5555-5555-5555-555555555555',
        'BSE',
        'Bachelor of Science in Engineering',
        'ABET-accredited engineering program with tracks in mechanical, electrical, and civil engineering.',
        2, -- BachelorsDegree
        'A3333333-3333-3333-3333-333333333333', -- ENG Department
        128, 4, 500.00,
        1, 0, GETUTCDATE()
    );
    PRINT '  - BS Engineering program created';
END

-- =====================================================
-- SECTION 3: TERMS
-- =====================================================
PRINT 'Seeding Terms...';

-- Spring 2026 (Current Term)
IF NOT EXISTS (SELECT 1 FROM Terms WHERE Code = '2026-SPRING')
BEGIN
    INSERT INTO Terms (Id, Code, Name, Type, AcademicYear, StartDate, EndDate, RegistrationStartDate, RegistrationEndDate, AddDropDeadline, WithdrawalDeadline, GradesDeadline, IsCurrent, IsActive, CreatedAt)
    VALUES (
        'C1111111-1111-1111-1111-111111111111',
        '2026-SPRING',
        'Spring 2026',
        1, -- Spring
        2026,
        '2026-01-13', '2026-05-09',
        '2025-11-01', '2026-01-10',
        '2026-01-27', '2026-03-21', '2026-05-16',
        1, 1, GETUTCDATE()
    );
    PRINT '  - Spring 2026 term created (CURRENT)';
END

-- Summer 2026
IF NOT EXISTS (SELECT 1 FROM Terms WHERE Code = '2026-SUMMER')
BEGIN
    INSERT INTO Terms (Id, Code, Name, Type, AcademicYear, StartDate, EndDate, RegistrationStartDate, RegistrationEndDate, AddDropDeadline, WithdrawalDeadline, GradesDeadline, IsCurrent, IsActive, CreatedAt)
    VALUES (
        'C2222222-2222-2222-2222-222222222222',
        '2026-SUMMER',
        'Summer 2026',
        2, -- Summer
        2026,
        '2026-05-26', '2026-08-07',
        '2026-03-15', '2026-05-22',
        '2026-06-02', '2026-06-27', '2026-08-14',
        0, 1, GETUTCDATE()
    );
    PRINT '  - Summer 2026 term created';
END

-- Fall 2026
IF NOT EXISTS (SELECT 1 FROM Terms WHERE Code = '2026-FALL')
BEGIN
    INSERT INTO Terms (Id, Code, Name, Type, AcademicYear, StartDate, EndDate, RegistrationStartDate, RegistrationEndDate, AddDropDeadline, WithdrawalDeadline, GradesDeadline, IsCurrent, IsActive, CreatedAt)
    VALUES (
        'C3333333-3333-3333-3333-333333333333',
        '2026-FALL',
        'Fall 2026',
        0, -- Fall
        2026,
        '2026-08-24', '2026-12-11',
        '2026-04-01', '2026-08-21',
        '2026-09-07', '2026-10-23', '2026-12-18',
        0, 1, GETUTCDATE()
    );
    PRINT '  - Fall 2026 term created';
END

-- Fall 2025 (Previous term for historical data)
IF NOT EXISTS (SELECT 1 FROM Terms WHERE Code = '2025-FALL')
BEGIN
    INSERT INTO Terms (Id, Code, Name, Type, AcademicYear, StartDate, EndDate, RegistrationStartDate, RegistrationEndDate, AddDropDeadline, WithdrawalDeadline, GradesDeadline, IsCurrent, IsActive, CreatedAt)
    VALUES (
        'C0000000-0000-0000-0000-000000000000',
        '2025-FALL',
        'Fall 2025',
        0, -- Fall
        2025,
        '2025-08-25', '2025-12-12',
        '2025-04-01', '2025-08-22',
        '2025-09-08', '2025-10-24', '2025-12-19',
        0, 1, GETUTCDATE()
    );
    PRINT '  - Fall 2025 term created (historical)';
END

-- =====================================================
-- SECTION 4: COURSES
-- =====================================================
PRINT 'Seeding Courses...';

-- CS Courses
IF NOT EXISTS (SELECT 1 FROM Courses WHERE Code = 'CS101')
BEGIN
    INSERT INTO Courses (Id, Code, Name, Description, DepartmentId, CreditHours, LectureHours, LabHours, Level, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'D1010101-0101-0101-0101-010101010101',
        'CS101',
        'Introduction to Programming',
        'Fundamentals of programming using Python. Covers variables, control structures, functions, and basic data structures.',
        'A1111111-1111-1111-1111-111111111111',
        3, 2, 2, 0, 1, 0, GETUTCDATE()
    );
    PRINT '  - CS101 Introduction to Programming created';
END

IF NOT EXISTS (SELECT 1 FROM Courses WHERE Code = 'CS201')
BEGIN
    INSERT INTO Courses (Id, Code, Name, Description, DepartmentId, CreditHours, LectureHours, LabHours, Level, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'D2020202-0202-0202-0202-020202020202',
        'CS201',
        'Data Structures',
        'Study of fundamental data structures: arrays, linked lists, stacks, queues, trees, and graphs. Algorithm analysis.',
        'A1111111-1111-1111-1111-111111111111',
        3, 3, 0, 0, 1, 0, GETUTCDATE()
    );
    PRINT '  - CS201 Data Structures created';
END

IF NOT EXISTS (SELECT 1 FROM Courses WHERE Code = 'CS301')
BEGIN
    INSERT INTO Courses (Id, Code, Name, Description, DepartmentId, CreditHours, LectureHours, LabHours, Level, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'D3030303-0303-0303-0303-030303030303',
        'CS301',
        'Algorithms',
        'Design and analysis of algorithms. Sorting, searching, graph algorithms, dynamic programming, and NP-completeness.',
        'A1111111-1111-1111-1111-111111111111',
        3, 3, 0, 0, 1, 0, GETUTCDATE()
    );
    PRINT '  - CS301 Algorithms created';
END

IF NOT EXISTS (SELECT 1 FROM Courses WHERE Code = 'CS401')
BEGIN
    INSERT INTO Courses (Id, Code, Name, Description, DepartmentId, CreditHours, LectureHours, LabHours, Level, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'D4040404-0404-0404-0404-040404040404',
        'CS401',
        'Software Engineering',
        'Software development methodologies, requirements analysis, design patterns, testing, and project management.',
        'A1111111-1111-1111-1111-111111111111',
        3, 2, 2, 0, 1, 0, GETUTCDATE()
    );
    PRINT '  - CS401 Software Engineering created';
END

IF NOT EXISTS (SELECT 1 FROM Courses WHERE Code = 'CS501')
BEGIN
    INSERT INTO Courses (Id, Code, Name, Description, DepartmentId, CreditHours, LectureHours, LabHours, Level, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'D5050505-0505-0505-0505-050505050505',
        'CS501',
        'Machine Learning',
        'Introduction to machine learning algorithms, supervised and unsupervised learning, neural networks.',
        'A1111111-1111-1111-1111-111111111111',
        3, 3, 0, 1, 1, 0, GETUTCDATE() -- Graduate level
    );
    PRINT '  - CS501 Machine Learning created';
END

-- Business Courses
IF NOT EXISTS (SELECT 1 FROM Courses WHERE Code = 'BUS101')
BEGIN
    INSERT INTO Courses (Id, Code, Name, Description, DepartmentId, CreditHours, LectureHours, LabHours, Level, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'D6060606-0606-0606-0606-060606060606',
        'BUS101',
        'Introduction to Business',
        'Overview of business concepts including management, marketing, finance, and entrepreneurship.',
        'A2222222-2222-2222-2222-222222222222',
        3, 3, 0, 0, 1, 0, GETUTCDATE()
    );
    PRINT '  - BUS101 Introduction to Business created';
END

IF NOT EXISTS (SELECT 1 FROM Courses WHERE Code = 'BUS201')
BEGIN
    INSERT INTO Courses (Id, Code, Name, Description, DepartmentId, CreditHours, LectureHours, LabHours, Level, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'D7070707-0707-0707-0707-070707070707',
        'BUS201',
        'Financial Accounting',
        'Principles of financial accounting, recording transactions, preparing financial statements.',
        'A2222222-2222-2222-2222-222222222222',
        3, 3, 0, 0, 1, 0, GETUTCDATE()
    );
    PRINT '  - BUS201 Financial Accounting created';
END

IF NOT EXISTS (SELECT 1 FROM Courses WHERE Code = 'MBA510')
BEGIN
    INSERT INTO Courses (Id, Code, Name, Description, DepartmentId, CreditHours, LectureHours, LabHours, Level, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'D8080808-0808-0808-0808-080808080808',
        'MBA510',
        'Strategic Management',
        'Advanced study of strategic planning, competitive analysis, and organizational strategy.',
        'A2222222-2222-2222-2222-222222222222',
        3, 3, 0, 1, 1, 0, GETUTCDATE() -- Graduate level
    );
    PRINT '  - MBA510 Strategic Management created';
END

-- Math Courses
IF NOT EXISTS (SELECT 1 FROM Courses WHERE Code = 'MATH101')
BEGIN
    INSERT INTO Courses (Id, Code, Name, Description, DepartmentId, CreditHours, LectureHours, LabHours, Level, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'D9090909-0909-0909-0909-090909090909',
        'MATH101',
        'Calculus I',
        'Introduction to differential calculus: limits, derivatives, and applications.',
        'A4444444-4444-4444-4444-444444444444',
        4, 4, 0, 0, 1, 0, GETUTCDATE()
    );
    PRINT '  - MATH101 Calculus I created';
END

IF NOT EXISTS (SELECT 1 FROM Courses WHERE Code = 'MATH201')
BEGIN
    INSERT INTO Courses (Id, Code, Name, Description, DepartmentId, CreditHours, LectureHours, LabHours, Level, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'D1010100-1010-1010-1010-101010101010',
        'MATH201',
        'Calculus II',
        'Integral calculus, sequences and series, multivariable calculus introduction.',
        'A4444444-4444-4444-4444-444444444444',
        4, 4, 0, 0, 1, 0, GETUTCDATE()
    );
    PRINT '  - MATH201 Calculus II created';
END

-- English Courses
IF NOT EXISTS (SELECT 1 FROM Courses WHERE Code = 'ENG101')
BEGIN
    INSERT INTO Courses (Id, Code, Name, Description, DepartmentId, CreditHours, LectureHours, LabHours, Level, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'D1111110-1111-1111-1111-111111111110',
        'ENG101',
        'English Composition',
        'Development of writing skills through essays, research papers, and critical analysis.',
        'A5555555-5555-5555-5555-555555555555',
        3, 3, 0, 0, 1, 0, GETUTCDATE()
    );
    PRINT '  - ENG101 English Composition created';
END

-- =====================================================
-- SECTION 5: BUILDINGS
-- =====================================================
PRINT 'Seeding Buildings...';

IF NOT EXISTS (SELECT 1 FROM Buildings WHERE Code = 'MAIN')
BEGIN
    INSERT INTO Buildings (Id, Code, Name, Description, Address, TotalFloors, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'E1111111-1111-1111-1111-111111111111',
        'MAIN',
        'Main Administration Building',
        'Central administration, classrooms, and student services.',
        '100 University Avenue',
        4, 1, 0, GETUTCDATE()
    );
    PRINT '  - Main Building created';
END

IF NOT EXISTS (SELECT 1 FROM Buildings WHERE Code = 'SCI')
BEGIN
    INSERT INTO Buildings (Id, Code, Name, Description, Address, TotalFloors, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'E2222222-2222-2222-2222-222222222222',
        'SCI',
        'Science Building',
        'Science departments, laboratories, and research facilities.',
        '200 University Avenue',
        3, 1, 0, GETUTCDATE()
    );
    PRINT '  - Science Building created';
END

IF NOT EXISTS (SELECT 1 FROM Buildings WHERE Code = 'ENGR')
BEGIN
    INSERT INTO Buildings (Id, Code, Name, Description, Address, TotalFloors, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'E3333333-3333-3333-3333-333333333333',
        'ENGR',
        'Engineering Building',
        'Engineering labs, workshops, and design studios.',
        '300 University Avenue',
        3, 1, 0, GETUTCDATE()
    );
    PRINT '  - Engineering Building created';
END

IF NOT EXISTS (SELECT 1 FROM Buildings WHERE Code = 'LIB')
BEGIN
    INSERT INTO Buildings (Id, Code, Name, Description, Address, TotalFloors, IsActive, IsDeleted, CreatedAt)
    VALUES (
        'E4444444-4444-4444-4444-444444444444',
        'LIB',
        'University Library',
        'Library, study rooms, and media center.',
        '150 University Avenue',
        2, 1, 0, GETUTCDATE()
    );
    PRINT '  - Library created';
END

-- =====================================================
-- SECTION 6: ROOMS
-- =====================================================
PRINT 'Seeding Rooms...';

-- Main Building Rooms
IF NOT EXISTS (SELECT 1 FROM Rooms WHERE BuildingId = 'E1111111-1111-1111-1111-111111111111' AND RoomNumber = '101')
BEGIN
    INSERT INTO Rooms (Id, BuildingId, RoomNumber, Name, Type, Capacity, Floor, Description, HasProjector, HasWhiteboard, HasComputers, ComputerCount, IsAccessible, IsActive, IsDeleted, CreatedAt)
    VALUES
        ('F1010101-0101-0101-0101-010101010101', 'E1111111-1111-1111-1111-111111111111', '101', 'Lecture Hall A', 0, 100, 1, 'Large lecture hall with tiered seating', 1, 1, 0, NULL, 1, 1, 0, GETUTCDATE()),
        ('F1020202-0202-0202-0202-020202020202', 'E1111111-1111-1111-1111-111111111111', '102', 'Lecture Hall B', 0, 80, 1, 'Medium lecture hall', 1, 1, 0, NULL, 1, 1, 0, GETUTCDATE()),
        ('F1030303-0303-0303-0303-030303030303', 'E1111111-1111-1111-1111-111111111111', '201', 'Classroom 201', 0, 35, 2, 'Standard classroom', 1, 1, 0, NULL, 1, 1, 0, GETUTCDATE()),
        ('F1040404-0404-0404-0404-040404040404', 'E1111111-1111-1111-1111-111111111111', '202', 'Classroom 202', 0, 35, 2, 'Standard classroom', 1, 1, 0, NULL, 1, 1, 0, GETUTCDATE()),
        ('F1050505-0505-0505-0505-050505050505', 'E1111111-1111-1111-1111-111111111111', '301', 'Conference Room A', 4, 20, 3, 'Conference room for meetings', 1, 1, 0, NULL, 1, 1, 0, GETUTCDATE());
    PRINT '  - Main Building rooms created';
END

-- Science Building Rooms
IF NOT EXISTS (SELECT 1 FROM Rooms WHERE BuildingId = 'E2222222-2222-2222-2222-222222222222' AND RoomNumber = '110')
BEGIN
    INSERT INTO Rooms (Id, BuildingId, RoomNumber, Name, Type, Capacity, Floor, Description, HasProjector, HasWhiteboard, HasComputers, ComputerCount, IsAccessible, IsActive, IsDeleted, CreatedAt)
    VALUES
        ('F2010101-0101-0101-0101-010101010101', 'E2222222-2222-2222-2222-222222222222', '110', 'Computer Lab 1', 2, 30, 1, 'General purpose computer lab', 1, 1, 1, 30, 1, 1, 0, GETUTCDATE()),
        ('F2020202-0202-0202-0202-020202020202', 'E2222222-2222-2222-2222-222222222222', '120', 'Computer Lab 2', 2, 25, 1, 'Programming lab with dual monitors', 1, 1, 1, 25, 1, 1, 0, GETUTCDATE()),
        ('F2030303-0303-0303-0303-030303030303', 'E2222222-2222-2222-2222-222222222222', '210', 'Chemistry Lab', 1, 24, 2, 'Chemistry laboratory with fume hoods', 1, 1, 0, NULL, 1, 1, 0, GETUTCDATE()),
        ('F2040404-0404-0404-0404-040404040404', 'E2222222-2222-2222-2222-222222222222', '220', 'Physics Lab', 1, 24, 2, 'Physics laboratory for experiments', 1, 1, 0, NULL, 1, 1, 0, GETUTCDATE()),
        ('F2050505-0505-0505-0505-050505050505', 'E2222222-2222-2222-2222-222222222222', '310', 'Math Classroom', 0, 40, 3, 'Classroom optimized for math instruction', 1, 1, 0, NULL, 1, 1, 0, GETUTCDATE());
    PRINT '  - Science Building rooms created';
END

-- Library Rooms
IF NOT EXISTS (SELECT 1 FROM Rooms WHERE BuildingId = 'E4444444-4444-4444-4444-444444444444' AND RoomNumber = '101')
BEGIN
    INSERT INTO Rooms (Id, BuildingId, RoomNumber, Name, Type, Capacity, Floor, Description, HasProjector, HasWhiteboard, HasComputers, ComputerCount, IsAccessible, IsActive, IsDeleted, CreatedAt)
    VALUES
        ('F4010101-0101-0101-0101-010101010101', 'E4444444-4444-4444-4444-444444444444', '101', 'Study Room A', 5, 8, 1, 'Small group study room', 0, 1, 0, NULL, 1, 1, 0, GETUTCDATE()),
        ('F4020202-0202-0202-0202-020202020202', 'E4444444-4444-4444-4444-444444444444', '102', 'Study Room B', 5, 8, 1, 'Small group study room', 0, 1, 0, NULL, 1, 1, 0, GETUTCDATE()),
        ('F4030303-0303-0303-0303-030303030303', 'E4444444-4444-4444-4444-444444444444', '201', 'Media Room', 0, 20, 2, 'Room with A/V equipment for presentations', 1, 1, 1, 5, 1, 1, 0, GETUTCDATE());
    PRINT '  - Library rooms created';
END

-- =====================================================
-- SECTION 7: COURSE SECTIONS (Spring 2026)
-- =====================================================
PRINT 'Seeding Course Sections for Spring 2026...';

-- Note: InstructorId should reference existing faculty users (created by Identity seed)
-- Using NULL for instructor until faculty users exist

IF NOT EXISTS (SELECT 1 FROM CourseSections WHERE CourseId = 'D1010101-0101-0101-0101-010101010101' AND TermId = 'C1111111-1111-1111-1111-111111111111' AND SectionNumber = '001')
BEGIN
    INSERT INTO CourseSections (Id, CourseId, TermId, SectionNumber, InstructorId, MaxEnrollment, CurrentEnrollment, WaitlistCapacity, WaitlistCount, Room, Building, Schedule, StartTime, EndTime, DaysOfWeek, IsOpen, IsCancelled, IsDeleted, CreatedAt)
    VALUES
        -- CS101 Sections
        ('G1010101-0001-0001-0001-000100010001', 'D1010101-0101-0101-0101-010101010101', 'C1111111-1111-1111-1111-111111111111', '001', NULL, 35, 0, 5, 0, '110', 'SCI', 'MWF 9:00 AM - 9:50 AM', '09:00', '09:50', 'MWF', 1, 0, 0, GETUTCDATE()),
        ('G1010101-0002-0002-0002-000200020002', 'D1010101-0101-0101-0101-010101010101', 'C1111111-1111-1111-1111-111111111111', '002', NULL, 35, 0, 5, 0, '120', 'SCI', 'TTH 10:00 AM - 11:15 AM', '10:00', '11:15', 'TTH', 1, 0, 0, GETUTCDATE()),

        -- CS201 Sections
        ('G2020202-0001-0001-0001-000100010001', 'D2020202-0202-0202-0202-020202020202', 'C1111111-1111-1111-1111-111111111111', '001', NULL, 30, 0, 5, 0, '201', 'MAIN', 'MWF 10:00 AM - 10:50 AM', '10:00', '10:50', 'MWF', 1, 0, 0, GETUTCDATE()),
        ('G2020202-0002-0002-0002-000200020002', 'D2020202-0202-0202-0202-020202020202', 'C1111111-1111-1111-1111-111111111111', '002', NULL, 30, 0, 5, 0, '202', 'MAIN', 'TTH 1:00 PM - 2:15 PM', '13:00', '14:15', 'TTH', 1, 0, 0, GETUTCDATE()),

        -- CS301 Section
        ('G3030303-0001-0001-0001-000100010001', 'D3030303-0303-0303-0303-030303030303', 'C1111111-1111-1111-1111-111111111111', '001', NULL, 25, 0, 3, 0, '201', 'MAIN', 'MWF 11:00 AM - 11:50 AM', '11:00', '11:50', 'MWF', 1, 0, 0, GETUTCDATE()),

        -- CS401 Section
        ('G4040404-0001-0001-0001-000100010001', 'D4040404-0404-0404-0404-040404040404', 'C1111111-1111-1111-1111-111111111111', '001', NULL, 25, 0, 3, 0, '110', 'SCI', 'TTH 2:30 PM - 3:45 PM', '14:30', '15:45', 'TTH', 1, 0, 0, GETUTCDATE()),

        -- BUS101 Sections
        ('G6060606-0001-0001-0001-000100010001', 'D6060606-0606-0606-0606-060606060606', 'C1111111-1111-1111-1111-111111111111', '001', NULL, 40, 0, 5, 0, '101', 'MAIN', 'MWF 9:00 AM - 9:50 AM', '09:00', '09:50', 'MWF', 1, 0, 0, GETUTCDATE()),
        ('G6060606-0002-0002-0002-000200020002', 'D6060606-0606-0606-0606-060606060606', 'C1111111-1111-1111-1111-111111111111', '002', NULL, 40, 0, 5, 0, '102', 'MAIN', 'TTH 11:30 AM - 12:45 PM', '11:30', '12:45', 'TTH', 1, 0, 0, GETUTCDATE()),

        -- BUS201 Section
        ('G7070707-0001-0001-0001-000100010001', 'D7070707-0707-0707-0707-070707070707', 'C1111111-1111-1111-1111-111111111111', '001', NULL, 35, 0, 5, 0, '202', 'MAIN', 'MWF 1:00 PM - 1:50 PM', '13:00', '13:50', 'MWF', 1, 0, 0, GETUTCDATE()),

        -- MATH101 Sections
        ('G9090909-0001-0001-0001-000100010001', 'D9090909-0909-0909-0909-090909090909', 'C1111111-1111-1111-1111-111111111111', '001', NULL, 35, 0, 5, 0, '310', 'SCI', 'MTWTH 8:00 AM - 8:50 AM', '08:00', '08:50', 'MTWTH', 1, 0, 0, GETUTCDATE()),
        ('G9090909-0002-0002-0002-000200020002', 'D9090909-0909-0909-0909-090909090909', 'C1111111-1111-1111-1111-111111111111', '002', NULL, 35, 0, 5, 0, '310', 'SCI', 'MTWTH 10:00 AM - 10:50 AM', '10:00', '10:50', 'MTWTH', 1, 0, 0, GETUTCDATE()),

        -- MATH201 Section
        ('G1010100-0001-0001-0001-000100010001', 'D1010100-1010-1010-1010-101010101010', 'C1111111-1111-1111-1111-111111111111', '001', NULL, 30, 0, 5, 0, '310', 'SCI', 'MTWTH 1:00 PM - 1:50 PM', '13:00', '13:50', 'MTWTH', 1, 0, 0, GETUTCDATE()),

        -- ENG101 Sections
        ('G1111110-0001-0001-0001-000100010001', 'D1111110-1111-1111-1111-111111111110', 'C1111111-1111-1111-1111-111111111111', '001', NULL, 25, 0, 3, 0, '201', 'MAIN', 'MWF 2:00 PM - 2:50 PM', '14:00', '14:50', 'MWF', 1, 0, 0, GETUTCDATE()),
        ('G1111110-0002-0002-0002-000200020002', 'D1111110-1111-1111-1111-111111111110', 'C1111111-1111-1111-1111-111111111111', '002', NULL, 25, 0, 3, 0, '202', 'MAIN', 'TTH 9:00 AM - 10:15 AM', '09:00', '10:15', 'TTH', 1, 0, 0, GETUTCDATE());

    PRINT '  - Course sections for Spring 2026 created';
END

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
PRINT '';
PRINT '============================================';
PRINT 'SEED DATA VERIFICATION';
PRINT '============================================';

SELECT 'Departments' as [Table], COUNT(*) as [Count] FROM Departments WHERE IsDeleted = 0
UNION ALL
SELECT 'Programs', COUNT(*) FROM Programs WHERE IsDeleted = 0
UNION ALL
SELECT 'Terms', COUNT(*) FROM Terms WHERE IsActive = 1
UNION ALL
SELECT 'Courses', COUNT(*) FROM Courses WHERE IsDeleted = 0
UNION ALL
SELECT 'Buildings', COUNT(*) FROM Buildings WHERE IsDeleted = 0
UNION ALL
SELECT 'Rooms', COUNT(*) FROM Rooms WHERE IsDeleted = 0
UNION ALL
SELECT 'CourseSections', COUNT(*) FROM CourseSections WHERE IsDeleted = 0;

PRINT '';
PRINT 'UniverSys Lite Training Data Seed Complete!';
PRINT '============================================';
GO
