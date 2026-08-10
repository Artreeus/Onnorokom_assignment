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
    public class AssignmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AssignmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAssignments([FromQuery] int? classCourseId, [FromQuery] int? subjectId, [FromQuery] string? status)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);
            int.TryParse(userIdStr, out int userId);

            var query = _context.Assignments
                .Include(a => a.ClassCourse)
                .Include(a => a.Subject)
                .Include(a => a.Teacher)
                .Include(a => a.Submissions)
                .AsQueryable();

            if (classCourseId.HasValue) query = query.Where(a => a.ClassCourseId == classCourseId.Value);
            if (subjectId.HasValue) query = query.Where(a => a.SubjectId == subjectId.Value);

            if (role == UserRoles.Student)
            {
                // Enrolled classes for this student
                var studentClassIds = await _context.ClassStudents
                    .Where(cs => cs.StudentId == userId)
                    .Select(cs => cs.ClassCourseId)
                    .ToListAsync();

                // Students ONLY see published assignments in their enrolled classes
                query = query.Where(a => studentClassIds.Contains(a.ClassCourseId) && a.Status == AssignmentStatus.Published);
            }
            else if (role == UserRoles.Teacher)
            {
                // Teachers see assignments they created or teach
                query = query.Where(a => a.TeacherId == userId);
                if (!string.IsNullOrWhiteSpace(status))
                {
                    query = query.Where(a => a.Status.ToLower() == status.ToLower());
                }
            }

            var assignments = await query
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new AssignmentDto(
                    a.Id,
                    a.Title,
                    a.Description,
                    a.ClassCourseId,
                    a.ClassCourse != null ? a.ClassCourse.Name : "",
                    a.SubjectId,
                    a.Subject != null ? a.Subject.Name : "",
                    a.TeacherId,
                    a.Teacher != null ? a.Teacher.FullName : "",
                    a.Deadline,
                    a.MaxMarks,
                    a.Status,
                    a.CreatedAt,
                    a.Submissions.Count,
                    DateTime.UtcNow > a.Deadline
                ))
                .ToListAsync();

            return Ok(assignments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAssignmentById(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);
            int.TryParse(userIdStr, out int userId);

            var assignment = await _context.Assignments
                .Include(a => a.ClassCourse)
                .Include(a => a.Subject)
                .Include(a => a.Teacher)
                .Include(a => a.Submissions)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null) return NotFound(new { message = "Assignment not found." });

            if (role == UserRoles.Student)
            {
                if (assignment.Status != AssignmentStatus.Published)
                {
                    return Forbid(); // Cannot access draft assignments
                }

                var isEnrolled = await _context.ClassStudents.AnyAsync(cs => cs.ClassCourseId == assignment.ClassCourseId && cs.StudentId == userId);
                if (!isEnrolled)
                {
                    return Forbid();
                }
            }

            var dto = new AssignmentDto(
                assignment.Id,
                assignment.Title,
                assignment.Description,
                assignment.ClassCourseId,
                assignment.ClassCourse?.Name ?? "",
                assignment.SubjectId,
                assignment.Subject?.Name ?? "",
                assignment.TeacherId,
                assignment.Teacher?.FullName ?? "",
                assignment.Deadline,
                assignment.MaxMarks,
                assignment.Status,
                assignment.CreatedAt,
                assignment.Submissions.Count,
                DateTime.UtcNow > assignment.Deadline
            );

            return Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = $"{UserRoles.Teacher},{UserRoles.Admin}")]
        public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int.TryParse(userIdStr, out int teacherId);

            var classCourse = await _context.ClassCourses.FindAsync(request.ClassCourseId);
            if (classCourse == null) return BadRequest(new { message = "Invalid class/course selected." });

            var subject = await _context.Subjects.FindAsync(request.SubjectId);
            if (subject == null) return BadRequest(new { message = "Invalid subject selected." });

            var assignment = new Assignment
            {
                Title = request.Title,
                Description = request.Description,
                ClassCourseId = request.ClassCourseId,
                SubjectId = request.SubjectId,
                TeacherId = teacherId,
                Deadline = request.Deadline.ToUniversalTime(),
                MaxMarks = request.MaxMarks,
                Status = string.IsNullOrWhiteSpace(request.Status) ? AssignmentStatus.Published : request.Status,
                CreatedAt = DateTime.UtcNow
            };

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAssignmentById), new { id = assignment.Id }, new AssignmentDto(
                assignment.Id,
                assignment.Title,
                assignment.Description,
                assignment.ClassCourseId,
                classCourse.Name,
                assignment.SubjectId,
                subject.Name,
                teacherId,
                User.FindFirstValue(ClaimTypes.Name) ?? "",
                assignment.Deadline,
                assignment.MaxMarks,
                assignment.Status,
                assignment.CreatedAt,
                0,
                DateTime.UtcNow > assignment.Deadline
            ));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = $"{UserRoles.Teacher},{UserRoles.Admin}")]
        public async Task<IActionResult> UpdateAssignment(int id, [FromBody] UpdateAssignmentDto request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);
            int.TryParse(userIdStr, out int userId);

            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null) return NotFound(new { message = "Assignment not found." });

            if (role != UserRoles.Admin && assignment.TeacherId != userId)
            {
                return Forbid();
            }

            if (!string.IsNullOrWhiteSpace(request.Title)) assignment.Title = request.Title;
            if (!string.IsNullOrWhiteSpace(request.Description)) assignment.Description = request.Description;
            if (request.ClassCourseId > 0) assignment.ClassCourseId = request.ClassCourseId;
            if (request.SubjectId > 0) assignment.SubjectId = request.SubjectId;
            if (request.Deadline != default) assignment.Deadline = request.Deadline.ToUniversalTime();
            if (request.MaxMarks > 0) assignment.MaxMarks = request.MaxMarks;
            if (!string.IsNullOrWhiteSpace(request.Status)) assignment.Status = request.Status;

            assignment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Assignment updated successfully." });
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = $"{UserRoles.Teacher},{UserRoles.Admin}")]
        public async Task<IActionResult> ToggleStatus(int id, [FromQuery] string status)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);
            int.TryParse(userIdStr, out int userId);

            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null) return NotFound(new { message = "Assignment not found." });

            if (role != UserRoles.Admin && assignment.TeacherId != userId) return Forbid();

            if (status != AssignmentStatus.Draft && status != AssignmentStatus.Published)
            {
                return BadRequest(new { message = "Status must be Draft or Published." });
            }

            assignment.Status = status;
            assignment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Assignment status updated to {status}." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = $"{UserRoles.Teacher},{UserRoles.Admin}")]
        public async Task<IActionResult> DeleteAssignment(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);
            int.TryParse(userIdStr, out int userId);

            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null) return NotFound(new { message = "Assignment not found." });

            if (role != UserRoles.Admin && assignment.TeacherId != userId) return Forbid();

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
