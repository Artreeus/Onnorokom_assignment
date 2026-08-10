using AssignmentSystem.Api.Controllers;
using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs;
using AssignmentSystem.Api.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;

namespace AssignmentSystem.Tests
{
    public class BusinessRuleTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);
            return context;
        }

        private SubmissionsController GetSubmissionsControllerWithUser(ApplicationDbContext context, int userId, string role)
        {
            var controller = new SubmissionsController(context);
            var userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role)
            };
            var identity = new ClaimsIdentity(userClaims, "TestAuth");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            return controller;
        }

        [Fact]
        public async Task SubmitAssignment_ShouldReject_WhenDeadlineHasPassed()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var student = new User { Id = 10, FullName = "John Doe", Email = "john@school.com", Role = UserRoles.Student };
            var classCourse = new ClassCourse { Id = 1, Name = "Class 10", Code = "C10" };
            
            // Assignment deadline is 2 days in the past
            var assignment = new Assignment
            {
                Id = 100,
                Title = "Past Deadline Assignment",
                Description = "Test",
                ClassCourseId = 1,
                TeacherId = 2,
                Deadline = DateTime.UtcNow.AddDays(-2),
                MaxMarks = 100,
                Status = AssignmentStatus.Published
            };

            context.Users.Add(student);
            context.ClassCourses.Add(classCourse);
            context.ClassStudents.Add(new ClassStudent { ClassCourseId = 1, StudentId = 10 });
            context.Assignments.Add(assignment);
            await context.SaveChangesAsync();

            var controller = GetSubmissionsControllerWithUser(context, 10, UserRoles.Student);
            var dto = new CreateSubmissionDto(100, "My late answer", null);

            // Act
            var result = await controller.SubmitAssignment(dto);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            var badRequest = result as BadRequestObjectResult;
            badRequest!.Value.ToString().Should().Contain("deadline has passed");
        }

        [Fact]
        public async Task SubmitAssignment_ShouldReject_WhenAssignmentIsDraft()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var student = new User { Id = 11, FullName = "Jane Doe", Email = "jane@school.com", Role = UserRoles.Student };
            var assignment = new Assignment
            {
                Id = 101,
                Title = "Draft Assignment",
                Description = "Not published yet",
                ClassCourseId = 1,
                TeacherId = 2,
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 100,
                Status = AssignmentStatus.Draft // Draft mode
            };

            context.Users.Add(student);
            context.Assignments.Add(assignment);
            context.ClassStudents.Add(new ClassStudent { ClassCourseId = 1, StudentId = 11 });
            await context.SaveChangesAsync();

            var controller = GetSubmissionsControllerWithUser(context, 11, UserRoles.Student);
            var dto = new CreateSubmissionDto(101, "My answer to draft", null);

            // Act
            var result = await controller.SubmitAssignment(dto);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            var badRequest = result as BadRequestObjectResult;
            badRequest!.Value.ToString().Should().Contain("draft assignments");
        }

        [Fact]
        public async Task GradeSubmission_ShouldReject_WhenScoreExceedsMaxMarks()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var teacher = new User { Id = 20, FullName = "Prof. Smith", Email = "prof@school.com", Role = UserRoles.Teacher };
            var assignment = new Assignment
            {
                Id = 200,
                Title = "Math Quiz",
                Description = "Quiz 1",
                TeacherId = 20,
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 50 // Max marks = 50
            };
            var submission = new Submission
            {
                Id = 500,
                AssignmentId = 200,
                StudentId = 30,
                SubmissionContent = "My answers",
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Submitted,
                Assignment = assignment
            };

            context.Users.Add(teacher);
            context.Assignments.Add(assignment);
            context.Submissions.Add(submission);
            await context.SaveChangesAsync();

            var controller = GetSubmissionsControllerWithUser(context, 20, UserRoles.Teacher);
            var gradeDto = new GradeSubmissionDto(Score: 75, Feedback: "Over maximum mark", Status: "Graded"); // 75 > 50

            // Act
            var result = await controller.GradeSubmission(500, gradeDto);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            var badRequest = result as BadRequestObjectResult;
            badRequest!.Value.ToString().Should().Contain("between 0 and maximum marks");
        }
    }
}
