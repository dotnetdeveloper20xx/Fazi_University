using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Students.Queries.GetStudentById;
using UniverSysLite.Application.Tests.Common;
using UniverSysLite.Domain.Entities.Academic;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Tests.Students;

public class GetStudentByIdQueryHandlerTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;

    public GetStudentByIdQueryHandlerTests()
    {
        _mockContext = MockDbContext.Create();
    }

    [Fact]
    public async Task Handle_WhenStudentExists_ShouldReturnStudentDetails()
    {
        // Arrange
        var studentId = Guid.NewGuid();
        var departmentId = Guid.NewGuid();
        var programId = Guid.NewGuid();

        var department = new Department
        {
            Id = departmentId,
            Code = "CS",
            Name = "Computer Science",
            IsActive = true
        };

        var program = new Program
        {
            Id = programId,
            DepartmentId = departmentId,
            Department = department,
            Code = "BSCS",
            Name = "Bachelor of Science in Computer Science",
            DegreeType = DegreeType.BachelorsDegree,
            TotalCreditsRequired = 120,
            DurationYears = 4,
            IsActive = true
        };

        var students = new List<Student>
        {
            new()
            {
                Id = studentId,
                StudentId = "STU-2025-00001",
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@student.edu",
                DateOfBirth = new DateOnly(2000, 1, 15),
                Gender = Gender.Male,
                Status = StudentStatus.Active,
                Type = StudentType.FullTime,
                ProgramId = programId,
                Program = program,
                DepartmentId = departmentId,
                Department = department,
                CumulativeGpa = 3.5m,
                TotalCreditsEarned = 60,
                TotalCreditsAttempted = 60,
                AcademicStanding = AcademicStanding.GoodStanding,
                AdmissionDate = DateTime.UtcNow.AddYears(-2),
                CreatedAt = DateTime.UtcNow.AddYears(-2)
            }
        };

        var mockStudentDbSet = MockDbContext.CreateMockDbSet(students);
        _mockContext.Setup(c => c.Students).Returns(mockStudentDbSet);

        var handler = new GetStudentByIdQueryHandler(_mockContext.Object);
        var query = new GetStudentByIdQuery(studentId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Id.Should().Be(studentId);
        result.Value.StudentId.Should().Be("STU-2025-00001");
        result.Value.FirstName.Should().Be("John");
        result.Value.LastName.Should().Be("Doe");
        result.Value.Email.Should().Be("john.doe@student.edu");
        result.Value.ProgramName.Should().Be("Bachelor of Science in Computer Science");
        result.Value.DepartmentName.Should().Be("Computer Science");
        result.Value.CumulativeGpa.Should().Be(3.5m);
    }

    [Fact]
    public async Task Handle_WhenStudentDoesNotExist_ShouldThrowNotFoundException()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var students = new List<Student>();

        var mockStudentDbSet = MockDbContext.CreateMockDbSet(students);
        _mockContext.Setup(c => c.Students).Returns(mockStudentDbSet);

        var handler = new GetStudentByIdQueryHandler(_mockContext.Object);
        var query = new GetStudentByIdQuery(nonExistentId);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(query, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenStudentHasNoProgram_ShouldReturnStudentWithNullProgramName()
    {
        // Arrange
        var studentId = Guid.NewGuid();

        var students = new List<Student>
        {
            new()
            {
                Id = studentId,
                StudentId = "STU-2025-00002",
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane.smith@student.edu",
                DateOfBirth = new DateOnly(2001, 5, 20),
                Gender = Gender.Female,
                Status = StudentStatus.Applicant,
                Type = StudentType.FullTime,
                CumulativeGpa = 0,
                TotalCreditsEarned = 0,
                TotalCreditsAttempted = 0,
                AcademicStanding = AcademicStanding.GoodStanding,
                AdmissionDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            }
        };

        var mockStudentDbSet = MockDbContext.CreateMockDbSet(students);
        _mockContext.Setup(c => c.Students).Returns(mockStudentDbSet);

        var handler = new GetStudentByIdQueryHandler(_mockContext.Object);
        var query = new GetStudentByIdQuery(studentId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.ProgramName.Should().BeNull();
        result.Value.DepartmentName.Should().BeNull();
    }
}
