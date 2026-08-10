using System.Security.Claims;
using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs;
using AssignmentSystem.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SubmissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SubmissionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("assignment/{assignmentId}")]
        public async Task<IActionResult> GetSubmissionsForAssignment(int assignmentId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);
            int.TryParse(userIdStr, out int userId);

            var assignment = await _context.Assignments.FindAsync(assignmentId);
            if (assignment == null) return NotFound(new { message = "Assignment not found." });

            var query = _context.Submissions
                .Include(s => s.Assignment)
                .Include(s => s.Student)
                .Where(s => s.AssignmentId == assignmentId);

            if (role == UserRoles.Student)
            {
                query = query.Where(s => s.StudentId == userId);
            }

            var submissions = await query
                .OrderByDescending(s => s.SubmittedAt)
                .Select(s => new SubmissionDto(
                    s.Id,
                    s.AssignmentId,
                    s.Assignment != null ? s.Assignment.Title : "",
                    s.Assignment != null ? s.Assignment.MaxMarks : 100,
                    s.StudentId,
                    s.Student != null ? s.Student.FullName : "",
                    s.Student != null ? s.Student.Email : "",
                    s.SubmissionContent,
                    s.AttachmentUrl,
                    s.SubmittedAt,
                    s.UpdatedAt,
                    s.Score,
                    s.Feedback,
                    s.Status
                ))
                .ToListAsync();

            return Ok(submissions);
        }

        [HttpGet]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> GetAllSubmissionsAdmin()
        {
            var submissions = await _context.Submissions
                .Include(s => s.Assignment)
                .Include(s => s.Student)
                .OrderByDescending(s => s.SubmittedAt)
                .Select(s => new SubmissionDto(
                    s.Id,
                    s.AssignmentId,
                    s.Assignment != null ? s.Assignment.Title : "",
                    s.Assignment != null ? s.Assignment.MaxMarks : 100,
                    s.StudentId,
                    s.Student != null ? s.Student.FullName : "",
                    s.Student != null ? s.Student.Email : "",
                    s.SubmissionContent,
                    s.AttachmentUrl,
                    s.SubmittedAt,
                    s.UpdatedAt,
                    s.Score,
                    s.Feedback,
                    s.Status
                ))
                .ToListAsync();

            return Ok(submissions);
        }

        [HttpGet("my-submissions")]
        [Authorize(Roles = UserRoles.Student)]
        public async Task<IActionResult> GetMySubmissions()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int.TryParse(userIdStr, out int studentId);

            var submissions = await _context.Submissions
                .Include(s => s.Assignment)
                .Include(s => s.Student)
                .Where(s => s.StudentId == studentId)
                .OrderByDescending(s => s.SubmittedAt)
                .Select(s => new SubmissionDto(
                    s.Id,
                    s.AssignmentId,
                    s.Assignment != null ? s.Assignment.Title : "",
                    s.Assignment != null ? s.Assignment.MaxMarks : 100,
                    s.StudentId,
                    s.Student != null ? s.Student.FullName : "",
                    s.Student != null ? s.Student.Email : "",
                    s.SubmissionContent,
                    s.AttachmentUrl,
                    s.SubmittedAt,
                    s.UpdatedAt,
                    s.Score,
                    s.Feedback,
                    s.Status
                ))
                .ToListAsync();

            return Ok(submissions);
        }

        [HttpPost]
        [Authorize(Roles = UserRoles.Student)]
        public async Task<IActionResult> SubmitAssignment([FromBody] CreateSubmissionDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int.TryParse(userIdStr, out int studentId);

            var assignment = await _context.Assignments.FindAsync(request.AssignmentId);
            if (assignment == null) return NotFound(new { message = "Assignment not found." });

            if (assignment.Status != AssignmentStatus.Published)
            {
                return BadRequest(new { message = "Cannot submit answers for draft assignments." });
            }

            // Deadline check rule
            if (DateTime.UtcNow > assignment.Deadline)
            {
                return BadRequest(new { message = "Submission deadline has passed. Submissions are no longer accepted." });
            }

            // Enrollment check rule
            var isEnrolled = await _context.ClassStudents.AnyAsync(cs => cs.ClassCourseId == assignment.ClassCourseId && cs.StudentId == studentId);
            if (!isEnrolled)
            {
                return Forbid();
            }

            // Check existing submission
            var existing = await _context.Submissions.FirstOrDefaultAsync(s => s.AssignmentId == request.AssignmentId && s.StudentId == studentId);
            if (existing != null)
            {
                return BadRequest(new { message = "You have already submitted an answer. Use the update submission endpoint before deadline if permitted." });
            }

            var submission = new Submission
            {
                AssignmentId = request.AssignmentId,
                StudentId = studentId,
                SubmissionContent = request.SubmissionContent,
                AttachmentUrl = request.AttachmentUrl,
                SubmittedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Submitted
            };

            _context.Submissions.Add(submission);
            await _context.SaveChangesAsync();

            var student = await _context.Users.FindAsync(studentId);

            return Ok(new SubmissionDto(
                submission.Id,
                submission.AssignmentId,
                assignment.Title,
                assignment.MaxMarks,
                submission.StudentId,
                student?.FullName ?? "",
                student?.Email ?? "",
                submission.SubmissionContent,
                submission.AttachmentUrl,
                submission.SubmittedAt,
                submission.UpdatedAt,
                null,
                null,
                submission.Status
            ));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = UserRoles.Student)]
        public async Task<IActionResult> UpdateSubmission(int id, [FromBody] UpdateSubmissionDto request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int.TryParse(userIdStr, out int studentId);

            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == id && s.StudentId == studentId);

            if (submission == null) return NotFound(new { message = "Submission not found." });

            if (submission.Assignment == null) return NotFound(new { message = "Associated assignment not found." });

            // Deadline check rule
            if (DateTime.UtcNow > submission.Assignment.Deadline)
            {
                return BadRequest(new { message = "Submission deadline has passed. Updates are no longer allowed." });
            }

            submission.SubmissionContent = request.SubmissionContent;
            if (request.AttachmentUrl != null) submission.AttachmentUrl = request.AttachmentUrl;
            submission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Submission updated successfully." });
        }

        [HttpPost("{id}/grade")]
        [Authorize(Roles = $"{UserRoles.Teacher},{UserRoles.Admin}")]
        public async Task<IActionResult> GradeSubmission(int id, [FromBody] GradeSubmissionDto request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);
            int.TryParse(userIdStr, out int userId);

            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (submission == null) return NotFound(new { message = "Submission not found." });

            if (role != UserRoles.Admin && submission.Assignment?.TeacherId != userId)
            {
                return Forbid();
            }

            if (request.Score < 0 || request.Score > submission.Assignment?.MaxMarks)
            {
                return BadRequest(new { message = $"Score must be between 0 and maximum marks ({submission.Assignment?.MaxMarks})." });
            }

            submission.Score = request.Score;
            submission.Feedback = request.Feedback;
            submission.Status = string.IsNullOrWhiteSpace(request.Status) ? SubmissionStatus.Graded : request.Status;
            submission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Submission graded successfully." });
        }
    }
}
