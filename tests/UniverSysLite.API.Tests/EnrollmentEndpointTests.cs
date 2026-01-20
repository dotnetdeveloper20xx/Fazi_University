using System.Net;
using FluentAssertions;
using UniverSysLite.API.Tests.Common;

namespace UniverSysLite.API.Tests;

public class EnrollmentEndpointTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public EnrollmentEndpointTests(CustomWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetEnrollments_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/enrollments");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetEnrollmentById_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var enrollmentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/enrollments/{enrollmentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetStudentEnrollments_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var studentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/enrollments/student/{studentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task EnrollStudent_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/enrollments", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DropEnrollment_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var enrollmentId = Guid.NewGuid();
        var content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json");

        // Act - Drop endpoint uses POST, not PUT
        var response = await _client.PostAsync($"/api/enrollments/{enrollmentId}/drop", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
