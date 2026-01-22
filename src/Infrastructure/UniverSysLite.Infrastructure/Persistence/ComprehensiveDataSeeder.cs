using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using UniverSysLite.Domain.Entities;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Infrastructure.Persistence;

/// <summary>
/// Comprehensive data seeder for testing all endpoints with heavy sample data.
/// </summary>
public static class ComprehensiveDataSeeder
{
    private static readonly Random _random = new(42); // Fixed seed for reproducible data

    public static async Task SeedComprehensiveDataAsync(ApplicationDbContext context, IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // Check if comprehensive data already exists
        if (await context.Departments.AnyAsync())
        {
            Console.WriteLine("Comprehensive data already seeded. Skipping...");
            return;
        }

        Console.WriteLine("Starting comprehensive data seeding...");

        // 1. Seed Users (Faculty, Registrar, Billing Staff)
        var facultyUsers = await SeedFacultyUsersAsync(userManager, context);
        Console.WriteLine($"Seeded {facultyUsers.Count} faculty users");

        var staffUsers = await SeedStaffUsersAsync(userManager, context);
        Console.WriteLine($"Seeded {staffUsers.Count} staff users");

        // 2. Seed Departments
        var departments = await SeedDepartmentsAsync(context);
        Console.WriteLine($"Seeded {departments.Count} departments");

        // 3. Seed Programs
        var programs = await SeedProgramsAsync(context, departments);
        Console.WriteLine($"Seeded {programs.Count} programs");

        // 4. Seed Courses
        var courses = await SeedCoursesAsync(context, departments);
        Console.WriteLine($"Seeded {courses.Count} courses");

        // 5. Seed Program Courses
        await SeedProgramCoursesAsync(context, programs, courses);
        Console.WriteLine("Seeded program courses");

        // 6. Seed Terms
        var terms = await SeedTermsAsync(context);
        Console.WriteLine($"Seeded {terms.Count} terms");

        // 7. Seed Course Sections
        var sections = await SeedCourseSectionsAsync(context, courses, terms, facultyUsers);
        Console.WriteLine($"Seeded {sections.Count} course sections");

        // 8. Seed Students
        var students = await SeedStudentsAsync(userManager, context, programs, departments);
        Console.WriteLine($"Seeded {students.Count} students");

        // 9. Seed Enrollments
        var enrollments = await SeedEnrollmentsAsync(context, students, sections, terms);
        Console.WriteLine($"Seeded {enrollments.Count} enrollments");

        // 10. Billing data is stored directly on Student entity (AccountBalance, HasFinancialHold)
        // Already set during student creation
        Console.WriteLine("Billing data set on student records");

        // 11. Seed Buildings and Rooms
        var buildings = await SeedBuildingsAsync(context);
        var rooms = await SeedRoomsAsync(context, buildings);
        Console.WriteLine($"Seeded {buildings.Count} buildings and {rooms.Count} rooms");

        // 12. Seed Room Bookings
        await SeedRoomBookingsAsync(context, rooms, sections, facultyUsers);
        Console.WriteLine("Seeded room bookings");

        // 13. Seed Notifications
        await SeedNotificationsAsync(context, students, staffUsers);
        Console.WriteLine("Seeded notifications");

        Console.WriteLine("Comprehensive data seeding completed!");
    }

    private static async Task<List<ApplicationUser>> SeedFacultyUsersAsync(
        UserManager<ApplicationUser> userManager, ApplicationDbContext context)
    {
        var facultyData = new[]
        {
            ("Dr. John", "Smith", "john.smith@universyslite.edu", "Computer Science"),
            ("Dr. Emily", "Johnson", "emily.johnson@universyslite.edu", "Computer Science"),
            ("Dr. Michael", "Williams", "michael.williams@universyslite.edu", "Mathematics"),
            ("Dr. Sarah", "Brown", "sarah.brown@universyslite.edu", "Mathematics"),
            ("Dr. David", "Jones", "david.jones@universyslite.edu", "Physics"),
            ("Dr. Lisa", "Garcia", "lisa.garcia@universyslite.edu", "Physics"),
            ("Dr. Robert", "Miller", "robert.miller@universyslite.edu", "Chemistry"),
            ("Dr. Jennifer", "Davis", "jennifer.davis@universyslite.edu", "Chemistry"),
            ("Dr. William", "Rodriguez", "william.rodriguez@universyslite.edu", "Biology"),
            ("Dr. Elizabeth", "Martinez", "elizabeth.martinez@universyslite.edu", "Biology"),
            ("Dr. James", "Anderson", "james.anderson@universyslite.edu", "English"),
            ("Dr. Patricia", "Taylor", "patricia.taylor@universyslite.edu", "English"),
            ("Dr. Richard", "Thomas", "richard.thomas@universyslite.edu", "History"),
            ("Dr. Linda", "Hernandez", "linda.hernandez@universyslite.edu", "History"),
            ("Dr. Charles", "Moore", "charles.moore@universyslite.edu", "Business"),
            ("Dr. Barbara", "Jackson", "barbara.jackson@universyslite.edu", "Business"),
            ("Dr. Joseph", "Martin", "joseph.martin@universyslite.edu", "Economics"),
            ("Dr. Susan", "Lee", "susan.lee@universyslite.edu", "Economics"),
            ("Dr. Thomas", "Perez", "thomas.perez@universyslite.edu", "Psychology"),
            ("Dr. Jessica", "Thompson", "jessica.thompson@universyslite.edu", "Psychology"),
        };

        var faculty = new List<ApplicationUser>();

        foreach (var (firstName, lastName, email, department) in facultyData)
        {
            if (await userManager.FindByEmailAsync(email) != null) continue;

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FirstName = firstName,
                LastName = lastName,
                DisplayName = $"{firstName} {lastName}",
                IsActive = true
            };

            var result = await userManager.CreateAsync(user, "Faculty@123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "Faculty");
                faculty.Add(user);

                context.UserProfiles.Add(new UserProfile
                {
                    UserId = user.Id,
                    Bio = $"Professor in the {department} department",
                    JobTitle = "Professor"
                });
            }
        }

        await context.SaveChangesAsync();
        return faculty;
    }

    private static async Task<List<ApplicationUser>> SeedStaffUsersAsync(
        UserManager<ApplicationUser> userManager, ApplicationDbContext context)
    {
        var staffData = new[]
        {
            ("Mary", "Wilson", "mary.wilson@universyslite.edu", "Registrar", "Senior Registrar"),
            ("James", "Clark", "james.clark@universyslite.edu", "Registrar", "Registrar"),
            ("Patricia", "Lewis", "patricia.lewis@universyslite.edu", "Registrar", "Assistant Registrar"),
            ("Robert", "Walker", "robert.walker@universyslite.edu", "BillingStaff", "Billing Manager"),
            ("Jennifer", "Hall", "jennifer.hall@universyslite.edu", "BillingStaff", "Billing Specialist"),
            ("Michael", "Allen", "michael.allen@universyslite.edu", "BillingStaff", "Accounts Clerk"),
            ("Linda", "Young", "linda.young@universyslite.edu", "ReadOnly", "Auditor"),
        };

        var staff = new List<ApplicationUser>();

        foreach (var (firstName, lastName, email, role, title) in staffData)
        {
            if (await userManager.FindByEmailAsync(email) != null) continue;

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FirstName = firstName,
                LastName = lastName,
                DisplayName = $"{firstName} {lastName}",
                IsActive = true
            };

            var result = await userManager.CreateAsync(user, "Staff@123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, role);
                staff.Add(user);

                context.UserProfiles.Add(new UserProfile
                {
                    UserId = user.Id,
                    JobTitle = title
                });
            }
        }

        await context.SaveChangesAsync();
        return staff;
    }

    private static async Task<List<Department>> SeedDepartmentsAsync(ApplicationDbContext context)
    {
        var departments = new List<Department>
        {
            new() { Code = "CS", Name = "Computer Science", Description = "Department of Computer Science and Information Technology", IsActive = true },
            new() { Code = "MATH", Name = "Mathematics", Description = "Department of Mathematics and Statistics", IsActive = true },
            new() { Code = "PHYS", Name = "Physics", Description = "Department of Physics and Astronomy", IsActive = true },
            new() { Code = "CHEM", Name = "Chemistry", Description = "Department of Chemistry and Biochemistry", IsActive = true },
            new() { Code = "BIO", Name = "Biology", Description = "Department of Biological Sciences", IsActive = true },
            new() { Code = "ENG", Name = "English", Description = "Department of English Language and Literature", IsActive = true },
            new() { Code = "HIST", Name = "History", Description = "Department of History and Political Science", IsActive = true },
            new() { Code = "BUS", Name = "Business", Description = "School of Business Administration", IsActive = true },
            new() { Code = "ECON", Name = "Economics", Description = "Department of Economics and Finance", IsActive = true },
            new() { Code = "PSY", Name = "Psychology", Description = "Department of Psychology and Behavioral Sciences", IsActive = true },
        };

        context.Departments.AddRange(departments);
        await context.SaveChangesAsync();
        return departments;
    }

    private static async Task<List<Program>> SeedProgramsAsync(ApplicationDbContext context, List<Department> departments)
    {
        var programs = new List<Program>();
        var deptLookup = departments.ToDictionary(d => d.Code, d => d.Id);

        var programData = new[]
        {
            ("CS", "BSCS", "Bachelor of Science in Computer Science", DegreeType.BachelorsDegree, 120, 4),
            ("CS", "MSCS", "Master of Science in Computer Science", DegreeType.MastersDegree, 36, 2),
            ("CS", "BSIT", "Bachelor of Science in Information Technology", DegreeType.BachelorsDegree, 120, 4),
            ("MATH", "BSMATH", "Bachelor of Science in Mathematics", DegreeType.BachelorsDegree, 120, 4),
            ("MATH", "MSMATH", "Master of Science in Mathematics", DegreeType.MastersDegree, 36, 2),
            ("PHYS", "BSPHYS", "Bachelor of Science in Physics", DegreeType.BachelorsDegree, 120, 4),
            ("PHYS", "MSPHYS", "Master of Science in Physics", DegreeType.MastersDegree, 36, 2),
            ("CHEM", "BSCHEM", "Bachelor of Science in Chemistry", DegreeType.BachelorsDegree, 120, 4),
            ("BIO", "BSBIO", "Bachelor of Science in Biology", DegreeType.BachelorsDegree, 120, 4),
            ("BIO", "MSBIO", "Master of Science in Biology", DegreeType.MastersDegree, 36, 2),
            ("ENG", "BAENG", "Bachelor of Arts in English", DegreeType.BachelorsDegree, 120, 4),
            ("HIST", "BAHIST", "Bachelor of Arts in History", DegreeType.BachelorsDegree, 120, 4),
            ("BUS", "BBA", "Bachelor of Business Administration", DegreeType.BachelorsDegree, 120, 4),
            ("BUS", "MBA", "Master of Business Administration", DegreeType.MastersDegree, 48, 2),
            ("ECON", "BSECON", "Bachelor of Science in Economics", DegreeType.BachelorsDegree, 120, 4),
            ("PSY", "BAPSY", "Bachelor of Arts in Psychology", DegreeType.BachelorsDegree, 120, 4),
            ("PSY", "MSPSY", "Master of Science in Psychology", DegreeType.MastersDegree, 36, 2),
        };

        foreach (var (deptCode, code, name, degree, credits, years) in programData)
        {
            programs.Add(new Program
            {
                DepartmentId = deptLookup[deptCode],
                Code = code,
                Name = name,
                Description = $"{name} program",
                DegreeType = degree,
                TotalCreditsRequired = credits,
                DurationYears = years,
                TuitionPerCredit = 350m + (decimal)(_random.NextDouble() * 200),
                IsActive = true
            });
        }

        context.Programs.AddRange(programs);
        await context.SaveChangesAsync();
        return programs;
    }

    private static async Task<List<Course>> SeedCoursesAsync(ApplicationDbContext context, List<Department> departments)
    {
        var courses = new List<Course>();
        var deptLookup = departments.ToDictionary(d => d.Code, d => d.Id);

        // Computer Science Courses
        var csCourses = new[]
        {
            ("CS101", "Introduction to Programming", CourseLevel.Undergraduate, 3),
            ("CS102", "Data Structures", CourseLevel.Undergraduate, 3),
            ("CS201", "Algorithms", CourseLevel.Undergraduate, 3),
            ("CS202", "Database Systems", CourseLevel.Undergraduate, 3),
            ("CS203", "Operating Systems", CourseLevel.Undergraduate, 3),
            ("CS204", "Computer Networks", CourseLevel.Undergraduate, 3),
            ("CS301", "Software Engineering", CourseLevel.Undergraduate, 3),
            ("CS302", "Artificial Intelligence", CourseLevel.Undergraduate, 3),
            ("CS303", "Machine Learning", CourseLevel.Undergraduate, 3),
            ("CS304", "Web Development", CourseLevel.Undergraduate, 3),
            ("CS305", "Mobile App Development", CourseLevel.Undergraduate, 3),
            ("CS401", "Cloud Computing", CourseLevel.Graduate, 3),
            ("CS402", "Cybersecurity", CourseLevel.Graduate, 3),
        };

        foreach (var (code, name, level, credits) in csCourses)
        {
            courses.Add(new Course
            {
                DepartmentId = deptLookup["CS"],
                Code = code,
                Name = name,
                Description = $"{name} - {level} level course",
                CreditHours = credits,
                Level = level,
                IsActive = true
            });
        }

        // Mathematics Courses
        var mathCourses = new[]
        {
            ("MATH101", "College Algebra", CourseLevel.Undergraduate, 3),
            ("MATH102", "Trigonometry", CourseLevel.Undergraduate, 3),
            ("MATH201", "Calculus I", CourseLevel.Undergraduate, 4),
            ("MATH202", "Calculus II", CourseLevel.Undergraduate, 4),
            ("MATH203", "Calculus III", CourseLevel.Undergraduate, 4),
            ("MATH301", "Linear Algebra", CourseLevel.Undergraduate, 3),
            ("MATH302", "Differential Equations", CourseLevel.Undergraduate, 3),
            ("MATH303", "Probability and Statistics", CourseLevel.Undergraduate, 3),
            ("MATH401", "Abstract Algebra", CourseLevel.Graduate, 3),
            ("MATH402", "Real Analysis", CourseLevel.Graduate, 3),
        };

        foreach (var (code, name, level, credits) in mathCourses)
        {
            courses.Add(new Course
            {
                DepartmentId = deptLookup["MATH"],
                Code = code,
                Name = name,
                Description = $"{name} - {level} level course",
                CreditHours = credits,
                Level = level,
                IsActive = true
            });
        }

        // Physics Courses
        var physCourses = new[]
        {
            ("PHYS101", "Introduction to Physics", CourseLevel.Undergraduate, 4),
            ("PHYS102", "General Physics I", CourseLevel.Undergraduate, 4),
            ("PHYS201", "General Physics II", CourseLevel.Undergraduate, 4),
            ("PHYS202", "Modern Physics", CourseLevel.Undergraduate, 3),
            ("PHYS301", "Quantum Mechanics", CourseLevel.Undergraduate, 3),
            ("PHYS302", "Thermodynamics", CourseLevel.Undergraduate, 3),
        };

        foreach (var (code, name, level, credits) in physCourses)
        {
            courses.Add(new Course
            {
                DepartmentId = deptLookup["PHYS"],
                Code = code,
                Name = name,
                Description = $"{name} - {level} level course",
                CreditHours = credits,
                Level = level,
                IsActive = true
            });
        }

        // Chemistry Courses
        var chemCourses = new[]
        {
            ("CHEM101", "General Chemistry I", CourseLevel.Undergraduate, 4),
            ("CHEM102", "General Chemistry II", CourseLevel.Undergraduate, 4),
            ("CHEM201", "Organic Chemistry I", CourseLevel.Undergraduate, 4),
            ("CHEM202", "Organic Chemistry II", CourseLevel.Undergraduate, 4),
            ("CHEM301", "Biochemistry", CourseLevel.Undergraduate, 3),
        };

        foreach (var (code, name, level, credits) in chemCourses)
        {
            courses.Add(new Course
            {
                DepartmentId = deptLookup["CHEM"],
                Code = code,
                Name = name,
                Description = $"{name} - {level} level course",
                CreditHours = credits,
                Level = level,
                IsActive = true
            });
        }

        // Biology Courses
        var bioCourses = new[]
        {
            ("BIO101", "Introduction to Biology", CourseLevel.Undergraduate, 4),
            ("BIO102", "Cell Biology", CourseLevel.Undergraduate, 4),
            ("BIO201", "Genetics", CourseLevel.Undergraduate, 3),
            ("BIO202", "Microbiology", CourseLevel.Undergraduate, 4),
            ("BIO301", "Molecular Biology", CourseLevel.Undergraduate, 3),
            ("BIO302", "Ecology", CourseLevel.Undergraduate, 3),
        };

        foreach (var (code, name, level, credits) in bioCourses)
        {
            courses.Add(new Course
            {
                DepartmentId = deptLookup["BIO"],
                Code = code,
                Name = name,
                Description = $"{name} - {level} level course",
                CreditHours = credits,
                Level = level,
                IsActive = true
            });
        }

        // English Courses
        var engCourses = new[]
        {
            ("ENG101", "English Composition I", CourseLevel.Undergraduate, 3),
            ("ENG102", "English Composition II", CourseLevel.Undergraduate, 3),
            ("ENG201", "American Literature", CourseLevel.Undergraduate, 3),
            ("ENG202", "British Literature", CourseLevel.Undergraduate, 3),
            ("ENG301", "Creative Writing", CourseLevel.Undergraduate, 3),
        };

        foreach (var (code, name, level, credits) in engCourses)
        {
            courses.Add(new Course
            {
                DepartmentId = deptLookup["ENG"],
                Code = code,
                Name = name,
                Description = $"{name} - {level} level course",
                CreditHours = credits,
                Level = level,
                IsActive = true
            });
        }

        // Business Courses
        var busCourses = new[]
        {
            ("BUS101", "Introduction to Business", CourseLevel.Undergraduate, 3),
            ("BUS201", "Principles of Management", CourseLevel.Undergraduate, 3),
            ("BUS202", "Marketing Fundamentals", CourseLevel.Undergraduate, 3),
            ("BUS301", "Financial Accounting", CourseLevel.Undergraduate, 3),
            ("BUS302", "Managerial Accounting", CourseLevel.Undergraduate, 3),
            ("BUS303", "Business Law", CourseLevel.Undergraduate, 3),
            ("BUS401", "Strategic Management", CourseLevel.Graduate, 3),
            ("BUS402", "International Business", CourseLevel.Graduate, 3),
        };

        foreach (var (code, name, level, credits) in busCourses)
        {
            courses.Add(new Course
            {
                DepartmentId = deptLookup["BUS"],
                Code = code,
                Name = name,
                Description = $"{name} - {level} level course",
                CreditHours = credits,
                Level = level,
                IsActive = true
            });
        }

        // Economics Courses
        var econCourses = new[]
        {
            ("ECON101", "Principles of Microeconomics", CourseLevel.Undergraduate, 3),
            ("ECON102", "Principles of Macroeconomics", CourseLevel.Undergraduate, 3),
            ("ECON201", "Intermediate Microeconomics", CourseLevel.Undergraduate, 3),
            ("ECON202", "Intermediate Macroeconomics", CourseLevel.Undergraduate, 3),
            ("ECON301", "Econometrics", CourseLevel.Undergraduate, 3),
        };

        foreach (var (code, name, level, credits) in econCourses)
        {
            courses.Add(new Course
            {
                DepartmentId = deptLookup["ECON"],
                Code = code,
                Name = name,
                Description = $"{name} - {level} level course",
                CreditHours = credits,
                Level = level,
                IsActive = true
            });
        }

        // Psychology Courses
        var psyCourses = new[]
        {
            ("PSY101", "Introduction to Psychology", CourseLevel.Undergraduate, 3),
            ("PSY201", "Developmental Psychology", CourseLevel.Undergraduate, 3),
            ("PSY202", "Social Psychology", CourseLevel.Undergraduate, 3),
            ("PSY301", "Abnormal Psychology", CourseLevel.Undergraduate, 3),
            ("PSY302", "Cognitive Psychology", CourseLevel.Undergraduate, 3),
            ("PSY401", "Research Methods in Psychology", CourseLevel.Graduate, 3),
        };

        foreach (var (code, name, level, credits) in psyCourses)
        {
            courses.Add(new Course
            {
                DepartmentId = deptLookup["PSY"],
                Code = code,
                Name = name,
                Description = $"{name} - {level} level course",
                CreditHours = credits,
                Level = level,
                IsActive = true
            });
        }

        // History Courses
        var histCourses = new[]
        {
            ("HIST101", "World History I", CourseLevel.Undergraduate, 3),
            ("HIST102", "World History II", CourseLevel.Undergraduate, 3),
            ("HIST201", "American History", CourseLevel.Undergraduate, 3),
            ("HIST202", "European History", CourseLevel.Undergraduate, 3),
            ("HIST301", "Ancient Civilizations", CourseLevel.Undergraduate, 3),
        };

        foreach (var (code, name, level, credits) in histCourses)
        {
            courses.Add(new Course
            {
                DepartmentId = deptLookup["HIST"],
                Code = code,
                Name = name,
                Description = $"{name} - {level} level course",
                CreditHours = credits,
                Level = level,
                IsActive = true
            });
        }

        context.Courses.AddRange(courses);
        await context.SaveChangesAsync();
        return courses;
    }

    private static async Task SeedProgramCoursesAsync(ApplicationDbContext context, List<Program> programs, List<Course> courses)
    {
        var programCourses = new List<ProgramCourse>();
        var courseLookup = courses.ToDictionary(c => c.Code, c => c);

        // BSCS required courses
        var bscsProgram = programs.First(p => p.Code == "BSCS");
        var bscsCourses = new[] { "CS101", "CS102", "CS201", "CS202", "CS203", "CS204", "CS301", "CS302", "MATH201", "MATH202", "MATH301", "ENG101" };
        foreach (var code in bscsCourses)
        {
            if (courseLookup.ContainsKey(code))
            {
                programCourses.Add(new ProgramCourse
                {
                    ProgramId = bscsProgram.Id,
                    CourseId = courseLookup[code].Id,
                    RequirementType = CourseRequirementType.Required,
                    SemesterRecommended = _random.Next(1, 8)
                });
            }
        }

        // BBA required courses
        var bbaProgram = programs.First(p => p.Code == "BBA");
        var bbaCourses = new[] { "BUS101", "BUS201", "BUS202", "BUS301", "BUS302", "BUS303", "ECON101", "ECON102", "MATH101", "ENG101" };
        foreach (var code in bbaCourses)
        {
            if (courseLookup.ContainsKey(code))
            {
                programCourses.Add(new ProgramCourse
                {
                    ProgramId = bbaProgram.Id,
                    CourseId = courseLookup[code].Id,
                    RequirementType = CourseRequirementType.Required,
                    SemesterRecommended = _random.Next(1, 8)
                });
            }
        }

        context.ProgramCourses.AddRange(programCourses);
        await context.SaveChangesAsync();
    }

    private static async Task<List<Term>> SeedTermsAsync(ApplicationDbContext context)
    {
        var terms = new List<Term>
        {
            // Past terms
            new() { Name = "Fall 2023", Code = "FA2023", Type = TermType.Fall, AcademicYear = 2023, StartDate = new DateOnly(2023, 8, 21), EndDate = new DateOnly(2023, 12, 15),
                    RegistrationStartDate = new DateOnly(2023, 7, 21), RegistrationEndDate = new DateOnly(2023, 8, 28),
                    AddDropDeadline = new DateOnly(2023, 9, 4), WithdrawalDeadline = new DateOnly(2023, 10, 20), GradesDeadline = new DateOnly(2023, 12, 22),
                    IsCurrent = false, IsActive = false },
            new() { Name = "Spring 2024", Code = "SP2024", Type = TermType.Spring, AcademicYear = 2024, StartDate = new DateOnly(2024, 1, 8), EndDate = new DateOnly(2024, 5, 10),
                    RegistrationStartDate = new DateOnly(2023, 12, 8), RegistrationEndDate = new DateOnly(2024, 1, 15),
                    AddDropDeadline = new DateOnly(2024, 1, 22), WithdrawalDeadline = new DateOnly(2024, 3, 8), GradesDeadline = new DateOnly(2024, 5, 17),
                    IsCurrent = false, IsActive = false },
            new() { Name = "Summer 2024", Code = "SU2024", Type = TermType.Summer, AcademicYear = 2024, StartDate = new DateOnly(2024, 5, 20), EndDate = new DateOnly(2024, 8, 9),
                    RegistrationStartDate = new DateOnly(2024, 4, 20), RegistrationEndDate = new DateOnly(2024, 5, 27),
                    AddDropDeadline = new DateOnly(2024, 6, 3), WithdrawalDeadline = new DateOnly(2024, 7, 5), GradesDeadline = new DateOnly(2024, 8, 16),
                    IsCurrent = false, IsActive = false },
            new() { Name = "Fall 2024", Code = "FA2024", Type = TermType.Fall, AcademicYear = 2024, StartDate = new DateOnly(2024, 8, 19), EndDate = new DateOnly(2024, 12, 13),
                    RegistrationStartDate = new DateOnly(2024, 7, 19), RegistrationEndDate = new DateOnly(2024, 8, 26),
                    AddDropDeadline = new DateOnly(2024, 9, 2), WithdrawalDeadline = new DateOnly(2024, 10, 18), GradesDeadline = new DateOnly(2024, 12, 20),
                    IsCurrent = false, IsActive = false },

            // Current term
            new() { Name = "Spring 2025", Code = "SP2025", Type = TermType.Spring, AcademicYear = 2025, StartDate = new DateOnly(2025, 1, 13), EndDate = new DateOnly(2025, 5, 9),
                    RegistrationStartDate = new DateOnly(2024, 12, 13), RegistrationEndDate = new DateOnly(2025, 1, 20),
                    AddDropDeadline = new DateOnly(2025, 1, 27), WithdrawalDeadline = new DateOnly(2025, 3, 14), GradesDeadline = new DateOnly(2025, 5, 16),
                    IsCurrent = true, IsActive = true },

            // Future terms
            new() { Name = "Summer 2025", Code = "SU2025", Type = TermType.Summer, AcademicYear = 2025, StartDate = new DateOnly(2025, 5, 19), EndDate = new DateOnly(2025, 8, 8),
                    RegistrationStartDate = new DateOnly(2025, 4, 19), RegistrationEndDate = new DateOnly(2025, 5, 26),
                    AddDropDeadline = new DateOnly(2025, 6, 2), WithdrawalDeadline = new DateOnly(2025, 7, 4), GradesDeadline = new DateOnly(2025, 8, 15),
                    IsCurrent = false, IsActive = true },
            new() { Name = "Fall 2025", Code = "FA2025", Type = TermType.Fall, AcademicYear = 2025, StartDate = new DateOnly(2025, 8, 18), EndDate = new DateOnly(2025, 12, 12),
                    RegistrationStartDate = new DateOnly(2025, 7, 18), RegistrationEndDate = new DateOnly(2025, 8, 25),
                    AddDropDeadline = new DateOnly(2025, 9, 1), WithdrawalDeadline = new DateOnly(2025, 10, 17), GradesDeadline = new DateOnly(2025, 12, 19),
                    IsCurrent = false, IsActive = true },
            new() { Name = "Spring 2026", Code = "SP2026", Type = TermType.Spring, AcademicYear = 2026, StartDate = new DateOnly(2026, 1, 12), EndDate = new DateOnly(2026, 5, 8),
                    RegistrationStartDate = new DateOnly(2025, 12, 12), RegistrationEndDate = new DateOnly(2026, 1, 19),
                    AddDropDeadline = new DateOnly(2026, 1, 26), WithdrawalDeadline = new DateOnly(2026, 3, 13), GradesDeadline = new DateOnly(2026, 5, 15),
                    IsCurrent = false, IsActive = true },
        };

        context.Terms.AddRange(terms);
        await context.SaveChangesAsync();
        return terms;
    }

    private static async Task<List<CourseSection>> SeedCourseSectionsAsync(
        ApplicationDbContext context, List<Course> courses, List<Term> terms, List<ApplicationUser> faculty)
    {
        var sections = new List<CourseSection>();

        foreach (var term in terms)
        {
            // Create 2-3 sections per course per term
            foreach (var course in courses)
            {
                var numSections = _random.Next(1, 4);
                for (int i = 0; i < numSections; i++)
                {
                    var instructor = faculty[_random.Next(faculty.Count)];
                    var capacity = _random.Next(20, 50);
                    var schedule = GetRandomSchedule();
                    var (startTime, endTime, days) = ParseSchedule(schedule);

                    sections.Add(new CourseSection
                    {
                        CourseId = course.Id,
                        TermId = term.Id,
                        InstructorId = instructor.Id,
                        SectionNumber = $"{course.Code}-{term.Code}-{(i + 1):D2}",
                        MaxEnrollment = capacity,
                        CurrentEnrollment = 0,
                        WaitlistCapacity = 10,
                        WaitlistCount = 0,
                        Building = $"Building {(char)('A' + _random.Next(5))}",
                        Room = $"Room {_random.Next(100, 400)}",
                        Schedule = schedule,
                        StartTime = startTime,
                        EndTime = endTime,
                        DaysOfWeek = days,
                        IsOpen = true,
                        IsCancelled = false
                    });
                }
            }
        }

        context.CourseSections.AddRange(sections);
        await context.SaveChangesAsync();
        return sections;
    }

    private static string GetRandomSchedule()
    {
        var schedules = new[]
        {
            "MWF 9:00 AM - 9:50 AM",
            "MWF 10:00 AM - 10:50 AM",
            "MWF 11:00 AM - 11:50 AM",
            "MWF 1:00 PM - 1:50 PM",
            "MWF 2:00 PM - 2:50 PM",
            "TTH 9:00 AM - 10:15 AM",
            "TTH 10:30 AM - 11:45 AM",
            "TTH 1:00 PM - 2:15 PM",
            "TTH 2:30 PM - 3:45 PM",
            "MW 6:00 PM - 7:15 PM",
            "TTH 6:00 PM - 7:15 PM",
        };
        return schedules[_random.Next(schedules.Length)];
    }

    private static (TimeOnly?, TimeOnly?, string?) ParseSchedule(string schedule)
    {
        // Simple parser for schedules like "MWF 9:00 AM - 9:50 AM"
        var parts = schedule.Split(' ', 2);
        if (parts.Length < 2) return (null, null, parts[0]);

        var days = parts[0];
        // For simplicity, return null times and just the days
        return (new TimeOnly(9, 0), new TimeOnly(10, 0), days);
    }

    private static async Task<List<Student>> SeedStudentsAsync(
        UserManager<ApplicationUser> userManager, ApplicationDbContext context,
        List<Program> programs, List<Department> departments)
    {
        var students = new List<Student>();
        var firstNames = new[] { "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William",
            "Mia", "James", "Charlotte", "Benjamin", "Amelia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander",
            "Abigail", "Michael", "Emily", "Daniel", "Elizabeth", "Jacob", "Sofia", "Logan", "Avery", "Jackson",
            "Ella", "Sebastian", "Scarlett", "Aiden", "Grace", "Matthew", "Chloe", "Samuel", "Victoria", "David",
            "Riley", "Joseph", "Aria", "Carter", "Lily", "Owen", "Aurora", "Wyatt", "Zoey", "John" };

        var lastNames = new[] { "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
            "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
            "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
            "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
            "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts" };

        for (int i = 1; i <= 150; i++)
        {
            var firstName = firstNames[_random.Next(firstNames.Length)];
            var lastName = lastNames[_random.Next(lastNames.Length)];
            var email = $"{firstName.ToLower()}.{lastName.ToLower()}{i}@student.universyslite.edu";

            // Create user account for student
            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FirstName = firstName,
                LastName = lastName,
                DisplayName = $"{firstName} {lastName}",
                IsActive = true
            };

            var result = await userManager.CreateAsync(user, "Student@123!");
            if (!result.Succeeded) continue;

            await userManager.AddToRoleAsync(user, "Student");

            var program = programs[_random.Next(programs.Count)];
            var admissionDate = DateTime.UtcNow.AddDays(-_random.Next(30, 1095));
            var gpa = Math.Round((decimal)(_random.NextDouble() * 2.5 + 1.5), 2); // GPA between 1.5 and 4.0

            var student = new Student
            {
                StudentId = $"STU-{admissionDate.Year}-{i:D5}",
                UserId = user.Id,
                FirstName = firstName,
                LastName = lastName,
                DateOfBirth = DateOnly.FromDateTime(DateTime.Now.AddYears(-_random.Next(18, 30))),
                Gender = (Gender)_random.Next(3),
                Email = email,
                Phone = $"555-{_random.Next(100, 999)}-{_random.Next(1000, 9999)}",
                AddressLine1 = $"{_random.Next(100, 9999)} {lastNames[_random.Next(lastNames.Length)]} Street",
                City = new[] { "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia" }[_random.Next(6)],
                State = new[] { "NY", "CA", "IL", "TX", "AZ", "PA" }[_random.Next(6)],
                PostalCode = $"{_random.Next(10000, 99999)}",
                Country = "USA",
                Status = (StudentStatus)_random.Next(1, 4), // Active, OnLeave, or Graduated
                Type = (StudentType)_random.Next(2),
                AdmissionDate = admissionDate,
                ProgramId = program.Id,
                DepartmentId = program.DepartmentId,
                CumulativeGpa = gpa,
                TotalCreditsEarned = _random.Next(0, 120),
                TotalCreditsAttempted = _random.Next(0, 130),
                AcademicStanding = gpa >= 2.0m ? AcademicStanding.GoodStanding :
                                   gpa >= 1.5m ? AcademicStanding.AcademicWarning : AcademicStanding.AcademicProbation,
                EmergencyContactName = $"{firstNames[_random.Next(firstNames.Length)]} {lastName}",
                EmergencyContactPhone = $"555-{_random.Next(100, 999)}-{_random.Next(1000, 9999)}",
                EmergencyContactRelationship = new[] { "Parent", "Spouse", "Sibling", "Guardian" }[_random.Next(4)],
                HasFinancialHold = _random.Next(10) == 0, // 10% chance
                HasAcademicHold = _random.Next(20) == 0, // 5% chance
                AccountBalance = (decimal)(_random.NextDouble() * 5000)
            };

            students.Add(student);
        }

        context.Students.AddRange(students);
        await context.SaveChangesAsync();
        return students;
    }

    private static async Task<List<Enrollment>> SeedEnrollmentsAsync(
        ApplicationDbContext context, List<Student> students, List<CourseSection> sections, List<Term> terms)
    {
        var enrollments = new List<Enrollment>();
        var enrolledCombinations = new HashSet<(Guid StudentId, Guid SectionId)>();
        var pastTerms = terms.Where(t => t.EndDate < DateOnly.FromDateTime(DateTime.Now)).ToList();
        var currentTerm = terms.FirstOrDefault(t => t.IsCurrent);

        foreach (var student in students)
        {
            // Enroll in 3-5 courses per past term
            foreach (var term in pastTerms)
            {
                var termSections = sections.Where(s => s.TermId == term.Id).ToList();
                var numCourses = _random.Next(3, 6);
                var selectedSections = termSections.OrderBy(_ => _random.Next()).Take(numCourses).ToList();

                foreach (var section in selectedSections)
                {
                    var key = (student.Id, section.Id);
                    if (enrolledCombinations.Contains(key)) continue;
                    enrolledCombinations.Add(key);

                    var grade = GetRandomGrade();
                    enrollments.Add(new Enrollment
                    {
                        StudentId = student.Id,
                        CourseSectionId = section.Id,
                        EnrollmentDate = term.StartDate.ToDateTime(TimeOnly.MinValue).AddDays(_random.Next(-10, 5)),
                        Status = EnrollmentStatus.Completed,
                        Grade = grade,
                        GradePoints = GetGradePoints(grade),
                        IsGradeFinalized = true,
                        GradeSubmittedAt = term.EndDate.ToDateTime(TimeOnly.MinValue).AddDays(5)
                    });
                }
            }

            // Enroll in 4-5 courses for current term
            if (currentTerm != null && student.Status == StudentStatus.Active)
            {
                var termSections = sections.Where(s => s.TermId == currentTerm.Id).ToList();
                var numCourses = _random.Next(4, 6);
                var selectedSections = termSections.OrderBy(_ => _random.Next()).Take(numCourses).ToList();

                foreach (var section in selectedSections)
                {
                    var key = (student.Id, section.Id);
                    if (enrolledCombinations.Contains(key)) continue;
                    enrolledCombinations.Add(key);

                    enrollments.Add(new Enrollment
                    {
                        StudentId = student.Id,
                        CourseSectionId = section.Id,
                        EnrollmentDate = currentTerm.StartDate.ToDateTime(TimeOnly.MinValue).AddDays(_random.Next(-10, 5)),
                        Status = EnrollmentStatus.Enrolled,
                        IsGradeFinalized = false
                    });
                }
            }
        }

        // Update section enrollment counts
        var enrollmentCounts = enrollments.GroupBy(e => e.CourseSectionId)
            .ToDictionary(g => g.Key, g => g.Count());

        foreach (var section in sections)
        {
            if (enrollmentCounts.TryGetValue(section.Id, out var count))
            {
                section.CurrentEnrollment = count;
            }
        }

        context.Enrollments.AddRange(enrollments);
        await context.SaveChangesAsync();
        return enrollments;
    }

    private static string GetRandomGrade()
    {
        var grades = new[] { "A", "A", "A", "A-", "A-", "B+", "B+", "B", "B", "B", "B-", "B-", "C+", "C+", "C", "C", "C-", "D+", "D", "D-", "F", "W" };
        return grades[_random.Next(grades.Length)];
    }

    private static decimal GetGradePoints(string grade)
    {
        return grade switch
        {
            "A" => 4.0m,
            "A-" => 3.7m,
            "B+" => 3.3m,
            "B" => 3.0m,
            "B-" => 2.7m,
            "C+" => 2.3m,
            "C" => 2.0m,
            "C-" => 1.7m,
            "D+" => 1.3m,
            "D" => 1.0m,
            "D-" => 0.7m,
            "F" => 0.0m,
            _ => 0.0m
        };
    }

    private static async Task<List<Building>> SeedBuildingsAsync(ApplicationDbContext context)
    {
        var buildings = new List<Building>
        {
            new() { Code = "SCI", Name = "Science Building", Description = "Main science and laboratory building", Address = "100 University Drive", TotalFloors = 4, IsActive = true },
            new() { Code = "ENG", Name = "Engineering Building", Description = "Engineering and technology center", Address = "200 University Drive", TotalFloors = 5, IsActive = true },
            new() { Code = "LIB", Name = "Main Library", Description = "University library and study center", Address = "300 University Drive", TotalFloors = 3, IsActive = true },
            new() { Code = "BUS", Name = "Business School", Description = "School of Business Administration", Address = "400 University Drive", TotalFloors = 4, IsActive = true },
            new() { Code = "HUM", Name = "Humanities Building", Description = "Arts and humanities center", Address = "500 University Drive", TotalFloors = 3, IsActive = true },
            new() { Code = "STU", Name = "Student Center", Description = "Student services and activities", Address = "600 University Drive", TotalFloors = 2, IsActive = true },
            new() { Code = "ADM", Name = "Administration Building", Description = "Administrative offices", Address = "700 University Drive", TotalFloors = 3, IsActive = true },
            new() { Code = "GYM", Name = "Recreation Center", Description = "Sports and recreation facility", Address = "800 University Drive", TotalFloors = 2, IsActive = true },
        };

        context.Buildings.AddRange(buildings);
        await context.SaveChangesAsync();
        return buildings;
    }

    private static async Task<List<Room>> SeedRoomsAsync(ApplicationDbContext context, List<Building> buildings)
    {
        var rooms = new List<Room>();
        var roomTypes = new[] { RoomType.Classroom, RoomType.Laboratory, RoomType.ComputerLab, RoomType.Auditorium, RoomType.ConferenceRoom, RoomType.Office };

        foreach (var building in buildings)
        {
            var floors = building.TotalFloors ?? 3;
            for (int floor = 1; floor <= floors; floor++)
            {
                var roomsPerFloor = _random.Next(8, 15);
                for (int r = 1; r <= roomsPerFloor; r++)
                {
                    var roomNumber = $"{floor}{r:D2}";
                    var roomType = roomTypes[_random.Next(roomTypes.Length)];
                    var capacity = roomType switch
                    {
                        RoomType.Classroom => _random.Next(25, 50),
                        RoomType.Auditorium => _random.Next(100, 300),
                        RoomType.Laboratory => _random.Next(20, 35),
                        RoomType.ComputerLab => _random.Next(25, 40),
                        RoomType.ConferenceRoom => _random.Next(10, 25),
                        RoomType.Office => _random.Next(1, 6),
                        _ => 30
                    };

                    rooms.Add(new Room
                    {
                        BuildingId = building.Id,
                        RoomNumber = roomNumber,
                        Name = $"{building.Code} {roomNumber}",
                        Type = roomType,
                        Capacity = capacity,
                        Floor = floor,
                        Description = $"{roomType} on floor {floor}",
                        HasProjector = _random.Next(4) != 0, // 75% have projector
                        HasWhiteboard = _random.Next(5) != 0, // 80% have whiteboard
                        HasComputers = roomType == RoomType.ComputerLab || _random.Next(5) == 0,
                        ComputerCount = roomType == RoomType.ComputerLab ? capacity : (_random.Next(5) == 0 ? _random.Next(5, 15) : 0),
                        IsAccessible = _random.Next(3) != 0, // 66% accessible
                        IsActive = true
                    });
                }
            }
        }

        context.Rooms.AddRange(rooms);
        await context.SaveChangesAsync();
        return rooms;
    }

    private static async Task SeedRoomBookingsAsync(
        ApplicationDbContext context, List<Room> rooms, List<CourseSection> sections, List<ApplicationUser> faculty)
    {
        var bookings = new List<RoomBooking>();
        var classrooms = rooms.Where(r => r.Type == RoomType.Classroom || r.Type == RoomType.Auditorium).ToList();

        // Book rooms for course sections
        foreach (var section in sections.Take(200)) // First 200 sections
        {
            var room = classrooms[_random.Next(classrooms.Count)];
            var startDate = section.Term?.StartDate ?? DateOnly.FromDateTime(DateTime.Now);
            var endDate = section.Term?.EndDate ?? DateOnly.FromDateTime(DateTime.Now.AddMonths(4));

            // Create weekly bookings
            var currentDate = startDate;
            while (currentDate <= endDate)
            {
                if (currentDate.DayOfWeek != DayOfWeek.Saturday && currentDate.DayOfWeek != DayOfWeek.Sunday)
                {
                    var startTime = new TimeOnly(_random.Next(8, 18), 0);
                    var endTime = startTime.AddHours(1).AddMinutes(15);

                    bookings.Add(new RoomBooking
                    {
                        RoomId = room.Id,
                        CourseSectionId = section.Id,
                        BookedById = section.InstructorId,
                        Title = $"{section.Course?.Code} - {section.Course?.Name}",
                        Description = $"Regular class session",
                        BookingType = BookingType.Class,
                        Date = currentDate,
                        StartTime = startTime,
                        EndTime = endTime,
                        IsRecurring = true,
                        RecurrencePattern = "Weekly",
                        Status = BookingStatus.Confirmed
                    });
                }
                currentDate = currentDate.AddDays(7);
            }
        }

        // Add some meeting bookings
        var conferenceRooms = rooms.Where(r => r.Type == RoomType.ConferenceRoom).ToList();
        for (int i = 0; i < 100 && conferenceRooms.Any(); i++)
        {
            var room = conferenceRooms[_random.Next(conferenceRooms.Count)];

            var date = DateOnly.FromDateTime(DateTime.Now.AddDays(_random.Next(-30, 60)));
            var startTime = new TimeOnly(_random.Next(9, 17), _random.Next(2) * 30);

            bookings.Add(new RoomBooking
            {
                RoomId = room.Id,
                BookedById = faculty[_random.Next(faculty.Count)].Id,
                Title = new[] { "Faculty Meeting", "Department Meeting", "Committee Meeting", "Research Discussion", "Project Review" }[_random.Next(5)],
                BookingType = BookingType.Meeting,
                Date = date,
                StartTime = startTime,
                EndTime = startTime.AddHours(_random.Next(1, 3)),
                Status = BookingStatus.Confirmed
            });
        }

        // Add some event bookings
        var auditoriums = rooms.Where(r => r.Type == RoomType.Auditorium).ToList();
        for (int i = 0; i < 50 && auditoriums.Any(); i++)
        {
            var room = auditoriums[_random.Next(auditoriums.Count)];

            var date = DateOnly.FromDateTime(DateTime.Now.AddDays(_random.Next(-30, 90)));

            bookings.Add(new RoomBooking
            {
                RoomId = room.Id,
                BookedById = faculty[_random.Next(faculty.Count)].Id,
                Title = new[] { "Guest Lecture", "Seminar", "Workshop", "Conference", "Orientation" }[_random.Next(5)],
                BookingType = BookingType.Event,
                Date = date,
                StartTime = new TimeOnly(_random.Next(9, 14), 0),
                EndTime = new TimeOnly(_random.Next(15, 20), 0),
                Status = BookingStatus.Confirmed
            });
        }

        context.RoomBookings.AddRange(bookings);
        await context.SaveChangesAsync();
    }

    private static async Task SeedNotificationsAsync(
        ApplicationDbContext context, List<Student> students, List<ApplicationUser> staff)
    {
        var notifications = new List<Notification>();

        // Create notifications for students
        foreach (var student in students.Take(100))
        {
            if (!student.UserId.HasValue) continue;

            // Grade posted notification
            notifications.Add(new Notification
            {
                UserId = student.UserId.Value,
                Type = NotificationType.GradePosted,
                Title = "Grade Posted",
                Message = "Your grade for CS101 has been posted. Check your transcript for details.",
                ActionUrl = "/grades",
                ActionText = "View Grades",
                Icon = "grade",
                Priority = NotificationPriority.Normal
            });

            // Registration reminder
            notifications.Add(new Notification
            {
                UserId = student.UserId.Value,
                Type = NotificationType.DeadlineReminder,
                Title = "Registration Opens Soon",
                Message = "Course registration for Spring 2025 opens in 3 days. Plan your schedule now!",
                ActionUrl = "/registration",
                ActionText = "Plan Schedule",
                Icon = "calendar",
                Priority = NotificationPriority.High
            });

            if (student.HasFinancialHold)
            {
                notifications.Add(new Notification
                {
                    UserId = student.UserId.Value,
                    Type = NotificationType.HoldPlaced,
                    Title = "Financial Hold on Account",
                    Message = "A financial hold has been placed on your account. Please contact the billing office.",
                    ActionUrl = "/billing",
                    ActionText = "View Balance",
                    Icon = "warning",
                    Priority = NotificationPriority.Urgent
                });
            }

            // Payment due notification
            if (_random.Next(3) == 0)
            {
                notifications.Add(new Notification
                {
                    UserId = student.UserId.Value,
                    Type = NotificationType.PaymentDue,
                    Title = "Payment Due",
                    Message = $"Your tuition payment of ${_random.Next(1000, 5000):N0} is due in 7 days.",
                    ActionUrl = "/billing/pay",
                    ActionText = "Make Payment",
                    Icon = "payment",
                    Priority = NotificationPriority.High
                });
            }

            // Mark some as read
            foreach (var notification in notifications.TakeLast(2))
            {
                if (_random.Next(2) == 0)
                {
                    notification.MarkAsRead();
                }
            }
        }

        // System notifications for staff
        foreach (var staffMember in staff)
        {
            notifications.Add(new Notification
            {
                UserId = staffMember.Id,
                Type = NotificationType.SystemAlert,
                Title = "System Maintenance",
                Message = "The system will be undergoing maintenance this weekend. Please save your work.",
                Icon = "info",
                Priority = NotificationPriority.Normal
            });

            notifications.Add(new Notification
            {
                UserId = staffMember.Id,
                Type = NotificationType.DeadlineReminder,
                Title = "Term End Approaching",
                Message = "The current term ends in 2 weeks. Please ensure all grades are submitted on time.",
                ActionUrl = "/courses",
                ActionText = "View Courses",
                Icon = "event",
                Priority = NotificationPriority.High
            });

            notifications.Add(new Notification
            {
                UserId = staffMember.Id,
                Type = NotificationType.SystemAlert,
                Title = "New Feature Available",
                Message = "The new bulk enrollment feature is now available. Check it out!",
                ActionUrl = "/enrollments",
                ActionText = "Try Now",
                Icon = "new_releases",
                Priority = NotificationPriority.Low
            });
        }

        // Add notifications for admin users
        var adminUsers = await context.UserRoles
            .Where(ur => context.Roles.Any(r => r.Id == ur.RoleId && r.Name == "Administrator"))
            .Select(ur => ur.UserId)
            .ToListAsync();

        foreach (var adminId in adminUsers)
        {
            var adminNotifications = new[]
            {
                new Notification
                {
                    UserId = adminId,
                    Type = NotificationType.SystemAlert,
                    Title = "Welcome to UniverSys Lite",
                    Message = "You are logged in as Administrator. You have full access to all system features.",
                    Icon = "admin_panel_settings",
                    Priority = NotificationPriority.Normal
                },
                new Notification
                {
                    UserId = adminId,
                    Type = NotificationType.SystemAlert,
                    Title = "System Health Check",
                    Message = "All system components are running normally. Database backup completed successfully.",
                    Icon = "check_circle",
                    Priority = NotificationPriority.Low
                },
                new Notification
                {
                    UserId = adminId,
                    Type = NotificationType.DeadlineReminder,
                    Title = "Registration Period Starting",
                    Message = "Spring 2025 registration opens next week. Ensure all course sections are properly configured.",
                    ActionUrl = "/courses",
                    ActionText = "View Courses",
                    Icon = "calendar_today",
                    Priority = NotificationPriority.High
                },
                new Notification
                {
                    UserId = adminId,
                    Type = NotificationType.SystemAlert,
                    Title = "New Users Registered",
                    Message = "15 new faculty members have been added to the system this month.",
                    ActionUrl = "/users",
                    ActionText = "View Users",
                    Icon = "group_add",
                    Priority = NotificationPriority.Normal
                },
                new Notification
                {
                    UserId = adminId,
                    Type = NotificationType.SystemAlert,
                    Title = "Enrollment Statistics",
                    Message = "Student enrollment for Spring 2025 is up 12% compared to last year.",
                    ActionUrl = "/dashboard",
                    ActionText = "View Dashboard",
                    Icon = "trending_up",
                    Priority = NotificationPriority.Normal
                },
                new Notification
                {
                    UserId = adminId,
                    Type = NotificationType.PaymentDue,
                    Title = "Outstanding Balances Report",
                    Message = "32 students have outstanding balances totaling $47,850. Consider sending payment reminders.",
                    ActionUrl = "/billing",
                    ActionText = "View Billing",
                    Icon = "payments",
                    Priority = NotificationPriority.High
                },
                new Notification
                {
                    UserId = adminId,
                    Type = NotificationType.SystemAlert,
                    Title = "Security Update",
                    Message = "A new security patch has been applied. All user sessions have been refreshed.",
                    Icon = "security",
                    Priority = NotificationPriority.Normal
                },
                new Notification
                {
                    UserId = adminId,
                    Type = NotificationType.DeadlineReminder,
                    Title = "Annual Audit Reminder",
                    Message = "The annual system audit is scheduled for next month. Please prepare all required documentation.",
                    Icon = "fact_check",
                    Priority = NotificationPriority.High
                }
            };

            notifications.AddRange(adminNotifications);

            // Mark a few as read
            notifications[notifications.Count - 1].MarkAsRead();
            notifications[notifications.Count - 3].MarkAsRead();
        }

        context.Notifications.AddRange(notifications);
        await context.SaveChangesAsync();
    }
}
