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
    public class SubmissionWorkflowTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
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
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
            };
            return controller;
        }

        [Fact]
        public async Task FullWorkflow_SubmitAndGrade_ShouldSucceed()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var teacher = new User { Id = 1, FullName = "Teacher 1", Role = UserRoles.Teacher };
            var student = new User { Id = 2, FullName = "Student 1", Role = UserRoles.Student };
            var classCourse = new ClassCourse { Id = 10, Name = "Class 10", Code = "C10" };
            var assignment = new Assignment
            {
                Id = 100,
                Title = "Physics Assignment",
                Description = "Solve 3 problems",
                ClassCourseId = 10,
                TeacherId = 1,
                Deadline = DateTime.UtcNow.AddDays(3),
                MaxMarks = 100,
                Status = AssignmentStatus.Published
            };

            context.Users.AddRange(teacher, student);
            context.ClassCourses.Add(classCourse);
            context.ClassStudents.Add(new ClassStudent { ClassCourseId = 10, StudentId = 2 });
            context.Assignments.Add(assignment);
            await context.SaveChangesAsync();

            // Act 1: Student Submits Answer
            var studentController = GetSubmissionsControllerWithUser(context, 2, UserRoles.Student);
            var submitDto = new CreateSubmissionDto(100, "Here are my solutions to problems 1, 2, and 3.", "https://example.com/file.pdf");
            var submitResult = await studentController.SubmitAssignment(submitDto);

            // Assert 1: Submission Successful
            submitResult.Should().BeOfType<OkObjectResult>();
            var okSubmit = submitResult as OkObjectResult;
            var subDto = okSubmit!.Value as SubmissionDto;
            subDto.Should().NotBeNull();
            subDto!.Status.Should().Be(SubmissionStatus.Submitted);

            // Act 2: Teacher Grades Submission
            var teacherController = GetSubmissionsControllerWithUser(context, 1, UserRoles.Teacher);
            var gradeDto = new GradeSubmissionDto(Score: 90, Feedback: "Great job on question 2!", Status: SubmissionStatus.Graded);
            var gradeResult = await teacherController.GradeSubmission(subDto.Id, gradeDto);

            // Assert 2: Grading Successful
            gradeResult.Should().BeOfType<OkObjectResult>();

            var updatedSub = await context.Submissions.FindAsync(subDto.Id);
            updatedSub.Should().NotBeNull();
            updatedSub!.Score.Should().Be(90);
            updatedSub.Feedback.Should().Be("Great job on question 2!");
            updatedSub.Status.Should().Be(SubmissionStatus.Graded);
        }

        [Fact]
        public async Task UpdateSubmission_ShouldSucceed_BeforeDeadline()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var student = new User { Id = 5, FullName = "Bob", Role = UserRoles.Student };
            var assignment = new Assignment
            {
                Id = 200,
                Title = "Chemistry Lab Report",
                Description = "Report",
                Deadline = DateTime.UtcNow.AddDays(2),
                MaxMarks = 50
            };
            var submission = new Submission
            {
                Id = 300,
                AssignmentId = 200,
                StudentId = 5,
                SubmissionContent = "Initial Draft",
                SubmittedAt = DateTime.UtcNow,
                Assignment = assignment
            };

            context.Users.Add(student);
            context.Assignments.Add(assignment);
            context.Submissions.Add(submission);
            await context.SaveChangesAsync();

            var controller = GetSubmissionsControllerWithUser(context, 5, UserRoles.Student);
            var updateDto = new UpdateSubmissionDto("Final Revised Draft with graphs", "https://example.com/revised.pdf");

            // Act
            var result = await controller.UpdateSubmission(300, updateDto);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var updatedInDb = await context.Submissions.FindAsync(300);
            updatedInDb!.SubmissionContent.Should().Be("Final Revised Draft with graphs");
        }
    }
}
