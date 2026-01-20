using System.Net;
using FluentAssertions;
using UniverSysLite.API.Tests.Common;

namespace UniverSysLite.API.Tests;

public class GradeEndpointTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public GradeEndpointTests(CustomWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetStudentGpa_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var studentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/grades/student/{studentId}/gpa");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetStudentTranscript_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var studentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/grades/student/{studentId}/transcript");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task SubmitGrade_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var enrollmentId = Guid.NewGuid();
        var content = new StringContent($"{{\"enrollmentId\":\"{enrollmentId}\",\"grade\":\"A\"}}", System.Text.Encoding.UTF8, "application/json");

        // Act - SubmitGrade uses POST /api/grades with body
        var response = await _client.PostAsync("/api/grades", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task FinalizeGrades_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var sectionId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsync($"/api/grades/section/{sectionId}/finalize", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
