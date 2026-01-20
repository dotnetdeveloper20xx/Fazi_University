using FluentAssertions;
using Moq;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Enrollments.Commands.EnrollStudent;
using UniverSysLite.Application.Tests.Common;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Tests.Enrollments;

public class EnrollStudentCommandHandlerTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<IDateTimeService> _mockDateTimeService;
    private readonly Mock<IAuditService> _mockAuditService;
    private readonly DateTime _testDateTime = new(2025, 1, 15, 10, 0, 0, DateTimeKind.Utc);

    public EnrollStudentCommandHandlerTests()
    {
        _mockContext = MockDbContext.Create();
        _mockDateTimeService = new Mock<IDateTimeService>();
        _mockAuditService = new Mock<IAuditService>();

        _mockDateTimeService.Setup(x => x.UtcNow).Returns(_testDateTime);
    }

    [Fact]
    public async Task Handle_WhenStudentDoesNotExist_ShouldThrowNotFoundException()
    {
        // Arrange
        var students = new List<Student>();
        var sections = new List<CourseSection>();
        var enrollments = new List<Enrollment>();
        var prerequisites = new List<CoursePrerequisite>();
        var courses = new List<Course>();

        _mockContext.Setup(c => c.Students).Returns(MockDbContext.CreateMockDbSet(students));
        _mockContext.Setup(c => c.CourseSections).Returns(MockDbContext.CreateMockDbSet(sections));
        _mockContext.Setup(c => c.Enrollments).Returns(MockDbContext.CreateMockDbSet(enrollments));
        _mockContext.Setup(c => c.CoursePrerequisites).Returns(MockDbContext.CreateMockDbSet(prerequisites));
        _mockContext.Setup(c => c.Courses).Returns(MockDbContext.CreateMockDbSet(courses));

        var handler = new EnrollStudentCommandHandler(
            _mockContext.Object,
            _mockDateTimeService.Object,
            _mockAuditService.Object);

        var command = new EnrollStudentCommand
        {
            StudentId = Guid.NewGuid(),
            CourseSectionId = Guid.NewGuid()
        };

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenCourseSectionDoesNotExist_ShouldThrowNotFoundException()
    {
        // Arrange
        var studentId = Guid.NewGuid();
        var sectionId = Guid.NewGuid();

        var students = new List<Student>
        {
            CreateTestStudent(studentId)
        };
        var sections = new List<CourseSection>();
        var enrollments = new List<Enrollment>();
        var prerequisites = new List<CoursePrerequisite>();
        var courses = new List<Course>();

        _mockContext.Setup(c => c.Students).Returns(MockDbContext.CreateMockDbSet(students));
        _mockContext.Setup(c => c.CourseSections).Returns(MockDbContext.CreateMockDbSet(sections));
        _mockContext.Setup(c => c.Enrollments).Returns(MockDbContext.CreateMockDbSet(enrollments));
        _mockContext.Setup(c => c.CoursePrerequisites).Returns(MockDbContext.CreateMockDbSet(prerequisites));
        _mockContext.Setup(c => c.Courses).Returns(MockDbContext.CreateMockDbSet(courses));

        var handler = new EnrollStudentCommandHandler(
            _mockContext.Object,
            _mockDateTimeService.Object,
            _mockAuditService.Object);

        var command = new EnrollStudentCommand
        {
            StudentId = studentId,
            CourseSectionId = sectionId
        };

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenSectionIsClosed_ShouldReturnFailure()
    {
        // Arrange
        var studentId = Guid.NewGuid();
        var sectionId = Guid.NewGuid();
        var courseId = Guid.NewGuid();
        var termId = Guid.NewGuid();

        var students = new List<Student> { CreateTestStudent(studentId) };
        var course = new Course { Id = courseId, Code = "CS101", Name = "Intro to CS", IsActive = true };
        var term = new Term { Id = termId, Name = "Spring 2025", Code = "SP2025", IsActive = true };
        var sections = new List<CourseSection>
        {
            new()
            {
                Id = sectionId,
                CourseId = courseId,
                Course = course,
                TermId = termId,
                Term = term,
                SectionNumber = "01",
                MaxEnrollment = 30,
                CurrentEnrollment = 0,
                IsOpen = false, // Section is closed
                IsCancelled = false
            }
        };
        var enrollments = new List<Enrollment>();
        var prerequisites = new List<CoursePrerequisite>();

        _mockContext.Setup(c => c.Students).Returns(MockDbContext.CreateMockDbSet(students));
        _mockContext.Setup(c => c.CourseSections).Returns(MockDbContext.CreateMockDbSet(sections));
        _mockContext.Setup(c => c.Enrollments).Returns(MockDbContext.CreateMockDbSet(enrollments));
        _mockContext.Setup(c => c.CoursePrerequisites).Returns(MockDbContext.CreateMockDbSet(prerequisites));
        _mockContext.Setup(c => c.Courses).Returns(MockDbContext.CreateMockDbSet(new List<Course> { course }));

        var handler = new EnrollStudentCommandHandler(
            _mockContext.Object,
            _mockDateTimeService.Object,
            _mockAuditService.Object);

        var command = new EnrollStudentCommand
        {
            StudentId = studentId,
            CourseSectionId = sectionId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Errors.Should().Contain("This course section is not open for enrollment.");
    }

    [Fact]
    public async Task Handle_WhenSectionIsCancelled_ShouldReturnFailure()
    {
        // Arrange
        var studentId = Guid.NewGuid();
        var sectionId = Guid.NewGuid();
        var courseId = Guid.NewGuid();
        var termId = Guid.NewGuid();

        var students = new List<Student> { CreateTestStudent(studentId) };
        var course = new Course { Id = courseId, Code = "CS101", Name = "Intro to CS", IsActive = true };
        var term = new Term { Id = termId, Name = "Spring 2025", Code = "SP2025", IsActive = true };
        var sections = new List<CourseSection>
        {
            new()
            {
                Id = sectionId,
                CourseId = courseId,
                Course = course,
                TermId = termId,
                Term = term,
                SectionNumber = "01",
                MaxEnrollment = 30,
                CurrentEnrollment = 0,
                IsOpen = true,
                IsCancelled = true // Section is cancelled
            }
        };
        var enrollments = new List<Enrollment>();
        var prerequisites = new List<CoursePrerequisite>();

        _mockContext.Setup(c => c.Students).Returns(MockDbContext.CreateMockDbSet(students));
        _mockContext.Setup(c => c.CourseSections).Returns(MockDbContext.CreateMockDbSet(sections));
        _mockContext.Setup(c => c.Enrollments).Returns(MockDbContext.CreateMockDbSet(enrollments));
        _mockContext.Setup(c => c.CoursePrerequisites).Returns(MockDbContext.CreateMockDbSet(prerequisites));
        _mockContext.Setup(c => c.Courses).Returns(MockDbContext.CreateMockDbSet(new List<Course> { course }));

        var handler = new EnrollStudentCommandHandler(
            _mockContext.Object,
            _mockDateTimeService.Object,
            _mockAuditService.Object);

        var command = new EnrollStudentCommand
        {
            StudentId = studentId,
            CourseSectionId = sectionId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Errors.Should().Contain("This course section has been cancelled.");
    }

    [Fact]
    public async Task Handle_WhenStudentAlreadyEnrolled_ShouldReturnFailure()
    {
        // Arrange
        var studentId = Guid.NewGuid();
        var sectionId = Guid.NewGuid();
        var courseId = Guid.NewGuid();
        var termId = Guid.NewGuid();

        var students = new List<Student> { CreateTestStudent(studentId) };
        var course = new Course { Id = courseId, Code = "CS101", Name = "Intro to CS", IsActive = true };
        var term = new Term { Id = termId, Name = "Spring 2025", Code = "SP2025", IsActive = true };
        var section = new CourseSection
        {
            Id = sectionId,
            CourseId = courseId,
            Course = course,
            TermId = termId,
            Term = term,
            SectionNumber = "01",
            MaxEnrollment = 30,
            CurrentEnrollment = 1,
            IsOpen = true,
            IsCancelled = false
        };
        var sections = new List<CourseSection> { section };
        var enrollments = new List<Enrollment>
        {
            new()
            {
                Id = Guid.NewGuid(),
                StudentId = studentId,
                CourseSectionId = sectionId,
                CourseSection = section,
                Status = EnrollmentStatus.Enrolled // Already enrolled
            }
        };
        var prerequisites = new List<CoursePrerequisite>();

        _mockContext.Setup(c => c.Students).Returns(MockDbContext.CreateMockDbSet(students));
        _mockContext.Setup(c => c.CourseSections).Returns(MockDbContext.CreateMockDbSet(sections));
        _mockContext.Setup(c => c.Enrollments).Returns(MockDbContext.CreateMockDbSet(enrollments));
        _mockContext.Setup(c => c.CoursePrerequisites).Returns(MockDbContext.CreateMockDbSet(prerequisites));
        _mockContext.Setup(c => c.Courses).Returns(MockDbContext.CreateMockDbSet(new List<Course> { course }));

        var handler = new EnrollStudentCommandHandler(
            _mockContext.Object,
            _mockDateTimeService.Object,
            _mockAuditService.Object);

        var command = new EnrollStudentCommand
        {
            StudentId = studentId,
            CourseSectionId = sectionId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Errors.Should().Contain("Student is already enrolled or waitlisted in this section.");
    }

    [Fact]
    public async Task Handle_WhenSectionIsFullAndNoWaitlistSpace_ShouldReturnFailure()
    {
        // Arrange
        var studentId = Guid.NewGuid();
        var sectionId = Guid.NewGuid();
        var courseId = Guid.NewGuid();
        var termId = Guid.NewGuid();

        var students = new List<Student> { CreateTestStudent(studentId) };
        var course = new Course { Id = courseId, Code = "CS101", Name = "Intro to CS", IsActive = true };
        var term = new Term { Id = termId, Name = "Spring 2025", Code = "SP2025", IsActive = true };
        var section = new CourseSection
        {
            Id = sectionId,
            CourseId = courseId,
            Course = course,
            TermId = termId,
            Term = term,
            SectionNumber = "01",
            MaxEnrollment = 30,
            CurrentEnrollment = 30, // Full
            WaitlistCapacity = 5,
            WaitlistCount = 5, // Waitlist also full
            IsOpen = true,
            IsCancelled = false
        };
        var sections = new List<CourseSection> { section };
        var enrollments = new List<Enrollment>();
        var prerequisites = new List<CoursePrerequisite>();

        _mockContext.Setup(c => c.Students).Returns(MockDbContext.CreateMockDbSet(students));
        _mockContext.Setup(c => c.CourseSections).Returns(MockDbContext.CreateMockDbSet(sections));
        _mockContext.Setup(c => c.Enrollments).Returns(MockDbContext.CreateMockDbSet(enrollments));
        _mockContext.Setup(c => c.CoursePrerequisites).Returns(MockDbContext.CreateMockDbSet(prerequisites));
        _mockContext.Setup(c => c.Courses).Returns(MockDbContext.CreateMockDbSet(new List<Course> { course }));

        var handler = new EnrollStudentCommandHandler(
            _mockContext.Object,
            _mockDateTimeService.Object,
            _mockAuditService.Object);

        var command = new EnrollStudentCommand
        {
            StudentId = studentId,
            CourseSectionId = sectionId
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Errors.Should().Contain("Section is full and waitlist is at capacity.");
    }

    private static Student CreateTestStudent(Guid id) => new()
    {
        Id = id,
        StudentId = "STU-2025-00001",
        FirstName = "Test",
        LastName = "Student",
        Email = "test@student.edu",
        DateOfBirth = new DateOnly(2000, 1, 1),
        Gender = Gender.Male,
        Status = StudentStatus.Active,
        Type = StudentType.FullTime,
        AdmissionDate = DateTime.UtcNow.AddYears(-1),
        IsDeleted = false
    };
}
