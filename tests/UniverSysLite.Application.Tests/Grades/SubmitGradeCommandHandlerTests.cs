using FluentAssertions;
using Moq;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Grades.Commands.SubmitGrade;
using UniverSysLite.Application.Tests.Common;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Tests.Grades;

public class SubmitGradeCommandHandlerTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<IDateTimeService> _mockDateTimeService;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IAuditService> _mockAuditService;
    private readonly DateTime _testDateTime = new(2025, 1, 15, 10, 0, 0, DateTimeKind.Utc);
    private readonly Guid _instructorId = Guid.NewGuid();

    public SubmitGradeCommandHandlerTests()
    {
        _mockContext = MockDbContext.Create();
        _mockDateTimeService = new Mock<IDateTimeService>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockAuditService = new Mock<IAuditService>();

        _mockDateTimeService.Setup(x => x.UtcNow).Returns(_testDateTime);
        _mockCurrentUserService.Setup(x => x.UserId).Returns(_instructorId);
    }

    [Fact]
    public async Task Handle_WhenEnrollmentDoesNotExist_ShouldThrowNotFoundException()
    {
        // Arrange
        var enrollments = new List<Enrollment>();
        _mockContext.Setup(c => c.Enrollments).Returns(MockDbContext.CreateMockDbSet(enrollments));

        var handler = new SubmitGradeCommandHandler(
            _mockContext.Object,
            _mockDateTimeService.Object,
            _mockCurrentUserService.Object,
            _mockAuditService.Object);

        var command = new SubmitGradeCommand
        {
            EnrollmentId = Guid.NewGuid(),
            Grade = "A"
        };

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenEnrollmentIsNotEnrolled_ShouldReturnFailure()
    {
        // Arrange
        var enrollmentId = Guid.NewGuid();
        var enrollment = CreateTestEnrollment(enrollmentId, EnrollmentStatus.Dropped);

        var enrollments = new List<Enrollment> { enrollment };
        _mockContext.Setup(c => c.Enrollments).Returns(MockDbContext.CreateMockDbSet(enrollments));

        var handler = new SubmitGradeCommandHandler(
            _mockContext.Object,
            _mockDateTimeService.Object,
            _mockCurrentUserService.Object,
            _mockAuditService.Object);

        var command = new SubmitGradeCommand
        {
            EnrollmentId = enrollmentId,
            Grade = "A"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Errors.Should().Contain("Grades can only be submitted for enrolled students.");
    }

    [Fact]
    public async Task Handle_WhenGradeIsAlreadyFinalized_ShouldReturnFailure()
    {
        // Arrange
        var enrollmentId = Guid.NewGuid();
        var enrollment = CreateTestEnrollment(enrollmentId, EnrollmentStatus.Enrolled);
        enrollment.IsGradeFinalized = true;

        var enrollments = new List<Enrollment> { enrollment };
        _mockContext.Setup(c => c.Enrollments).Returns(MockDbContext.CreateMockDbSet(enrollments));

        var handler = new SubmitGradeCommandHandler(
            _mockContext.Object,
            _mockDateTimeService.Object,
            _mockCurrentUserService.Object,
            _mockAuditService.Object);

        var command = new SubmitGradeCommand
        {
            EnrollmentId = enrollmentId,
            Grade = "A"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Errors.Should().Contain("Grade has already been finalized and cannot be changed.");
    }

    [Theory]
    [InlineData("X")]
    [InlineData("AA")]
    [InlineData("")]
    [InlineData("Z+")]
    public async Task Handle_WhenGradeIsInvalid_ShouldReturnFailure(string invalidGrade)
    {
        // Arrange
        var enrollmentId = Guid.NewGuid();
        var enrollment = CreateTestEnrollment(enrollmentId, EnrollmentStatus.Enrolled);

        var enrollments = new List<Enrollment> { enrollment };
        _mockContext.Setup(c => c.Enrollments).Returns(MockDbContext.CreateMockDbSet(enrollments));

        var handler = new SubmitGradeCommandHandler(
            _mockContext.Object,
            _mockDateTimeService.Object,
            _mockCurrentUserService.Object,
            _mockAuditService.Object);

        var command = new SubmitGradeCommand
        {
            EnrollmentId = enrollmentId,
            Grade = invalidGrade
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Errors.First().Should().Contain("Invalid grade");
    }

    [Theory]
    [InlineData("A+", 4.0)]
    [InlineData("A", 4.0)]
    [InlineData("A-", 3.7)]
    [InlineData("B+", 3.3)]
    [InlineData("B", 3.0)]
    [InlineData("B-", 2.7)]
    [InlineData("C+", 2.3)]
    [InlineData("C", 2.0)]
    [InlineData("C-", 1.7)]
    [InlineData("D+", 1.3)]
    [InlineData("D", 1.0)]
    [InlineData("D-", 0.7)]
    [InlineData("F", 0.0)]
    public async Task Handle_WhenGradeIsValid_ShouldSetCorrectGradePoints(string grade, decimal expectedGradePoints)
    {
        // Arrange
        var enrollmentId = Guid.NewGuid();
        var enrollment = CreateTestEnrollment(enrollmentId, EnrollmentStatus.Enrolled);

        var enrollments = new List<Enrollment> { enrollment };
        _mockContext.Setup(c => c.Enrollments).Returns(MockDbContext.CreateMockDbSet(enrollments));

        var handler = new SubmitGradeCommandHandler(
            _mockContext.Object,
            _mockDateTimeService.Object,
            _mockCurrentUserService.Object,
            _mockAuditService.Object);

        var command = new SubmitGradeCommand
        {
            EnrollmentId = enrollmentId,
            Grade = grade,
            NumericGrade = 95
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        enrollment.Grade.Should().Be(grade.ToUpper());
        enrollment.GradePoints.Should().Be(expectedGradePoints);
        enrollment.GradeSubmittedAt.Should().Be(_testDateTime);
        enrollment.GradeSubmittedById.Should().Be(_instructorId);
        _mockContext.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenGradeIsLowercase_ShouldNormalizeToUppercase()
    {
        // Arrange
        var enrollmentId = Guid.NewGuid();
        var enrollment = CreateTestEnrollment(enrollmentId, EnrollmentStatus.Enrolled);

        var enrollments = new List<Enrollment> { enrollment };
        _mockContext.Setup(c => c.Enrollments).Returns(MockDbContext.CreateMockDbSet(enrollments));

        var handler = new SubmitGradeCommandHandler(
            _mockContext.Object,
            _mockDateTimeService.Object,
            _mockCurrentUserService.Object,
            _mockAuditService.Object);

        var command = new SubmitGradeCommand
        {
            EnrollmentId = enrollmentId,
            Grade = "b+"  // lowercase
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        enrollment.Grade.Should().Be("B+");  // normalized to uppercase
    }

    private static Enrollment CreateTestEnrollment(Guid id, EnrollmentStatus status)
    {
        var studentId = Guid.NewGuid();
        var sectionId = Guid.NewGuid();
        var courseId = Guid.NewGuid();

        var student = new Student
        {
            Id = studentId,
            StudentId = "STU-2025-00001",
            FirstName = "Test",
            LastName = "Student",
            Email = "test@student.edu",
            DateOfBirth = new DateOnly(2000, 1, 1),
            Gender = Gender.Male,
            Status = StudentStatus.Active,
            Type = StudentType.FullTime
        };

        var course = new Course
        {
            Id = courseId,
            Code = "CS101",
            Name = "Intro to Programming",
            CreditHours = 3,
            IsActive = true
        };

        var section = new CourseSection
        {
            Id = sectionId,
            CourseId = courseId,
            Course = course,
            SectionNumber = "01",
            IsOpen = true
        };

        return new Enrollment
        {
            Id = id,
            StudentId = studentId,
            Student = student,
            CourseSectionId = sectionId,
            CourseSection = section,
            Status = status,
            EnrollmentDate = DateTime.UtcNow.AddMonths(-3),
            IsGradeFinalized = false
        };
    }
}
