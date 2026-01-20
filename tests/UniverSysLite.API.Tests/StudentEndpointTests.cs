using System.Net;
using FluentAssertions;
using UniverSysLite.API.Tests.Common;

namespace UniverSysLite.API.Tests;

public class StudentEndpointTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public StudentEndpointTests(CustomWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetStudents_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/students");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetStudentById_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var studentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/students/{studentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateStudent_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/students", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateStudent_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var studentId = Guid.NewGuid();
        var content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync($"/api/students/{studentId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DeleteStudent_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var studentId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/students/{studentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
