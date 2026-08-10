using AssignmentSystem.Api.Models;
using AssignmentSystem.Api.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Xunit;

namespace AssignmentSystem.Tests
{
    public class AuthorizationTests
    {
        [Fact]
        public void JwtService_ShouldGenerateTokenWithRoleClaims()
        {
            // Arrange
            var inMemorySettings = new Dictionary<string, string?>
            {
                {"Jwt:SecretKey", "TestSecretKeySuperLongSecretForUnitTests1234567890!"},
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"}
            };

            IConfiguration config = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            var jwtService = new JwtService(config);
            var user = new User
            {
                Id = 42,
                FullName = "Teacher Alice",
                Email = "alice@school.com",
                Role = UserRoles.Teacher
            };

            // Act
            var tokenString = jwtService.GenerateToken(user);

            // Assert
            tokenString.Should().NotBeNullOrEmpty();

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(tokenString);

            jwtToken.Issuer.Should().Be("TestIssuer");
            var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role");
            roleClaim.Should().NotBeNull();
            roleClaim!.Value.Should().Be(UserRoles.Teacher);

            var subClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub || c.Type == ClaimTypes.NameIdentifier);
            subClaim.Should().NotBeNull();
            subClaim!.Value.Should().Be("42");
        }
    }
}
