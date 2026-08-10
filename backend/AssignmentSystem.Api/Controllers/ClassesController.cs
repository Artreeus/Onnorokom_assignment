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
    public class ClassesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClassesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetClasses()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);
            int.TryParse(userIdStr, out int userId);

            var query = _context.ClassCourses.AsQueryable();

            // If student, optionally filter to enrolled classes (or show all if admin/teacher)
            if (role == UserRoles.Student)
            {
                var enrolledClassIds = await _context.ClassStudents
                    .Where(cs => cs.StudentId == userId)
                    .Select(cs => cs.ClassCourseId)
                    .ToListAsync();

                query = query.Where(c => enrolledClassIds.Contains(c.Id));
            }
            else if (role == UserRoles.Teacher)
            {
                var teachingClassIds = await _context.ClassSubjectTeachers
                    .Where(cst => cst.TeacherId == userId)
                    .Select(cst => cst.ClassCourseId)
                    .ToListAsync();

                query = query.Where(c => teachingClassIds.Contains(c.Id));
            }

            var classes = await query
                .Select(c => new ClassCourseDto(
                    c.Id,
                    c.Name,
                    c.Code,
                    c.Description,
                    c.EnrolledStudents.Count,
                    c.SubjectTeachers.Count
                ))
                .ToListAsync();

            return Ok(classes);
        }

        [HttpGet("all")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> GetAllClassesAdmin()
        {
            var classes = await _context.ClassCourses
                .Select(c => new ClassCourseDto(
                    c.Id,
                    c.Name,
                    c.Code,
                    c.Description,
                    c.EnrolledStudents.Count,
                    c.SubjectTeachers.Count
                ))
                .ToListAsync();

            return Ok(classes);
        }

        [HttpPost]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> CreateClass([FromBody] CreateClassDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _context.ClassCourses.AnyAsync(c => c.Code.ToLower() == request.Code.ToLower());
            if (exists) return BadRequest(new { message = "Class code already exists." });

            var classCourse = new ClassCourse
            {
                Name = request.Name,
                Code = request.Code,
                Description = request.Description
            };

            _context.ClassCourses.Add(classCourse);
            await _context.SaveChangesAsync();

            return Ok(new ClassCourseDto(classCourse.Id, classCourse.Name, classCourse.Code, classCourse.Description, 0, 0));
        }

        [HttpPost("assign-teacher")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> AssignTeacher([FromBody] AssignTeacherDto request)
        {
            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.TeacherId && u.Role == UserRoles.Teacher);
            if (teacher == null) return BadRequest(new { message = "Teacher not found or user is not a teacher." });

            var classCourse = await _context.ClassCourses.FindAsync(request.ClassCourseId);
            if (classCourse == null) return NotFound(new { message = "Class not found." });

            var subject = await _context.Subjects.FindAsync(request.SubjectId);
            if (subject == null) return NotFound(new { message = "Subject not found." });

            var existing = await _context.ClassSubjectTeachers.FirstOrDefaultAsync(cst =>
                cst.ClassCourseId == request.ClassCourseId &&
                cst.SubjectId == request.SubjectId &&
                cst.TeacherId == request.TeacherId);

            if (existing != null) return BadRequest(new { message = "Teacher is already assigned to this subject in this class." });

            var cst = new ClassSubjectTeacher
            {
                ClassCourseId = request.ClassCourseId,
                SubjectId = request.SubjectId,
                TeacherId = request.TeacherId
            };

            _context.ClassSubjectTeachers.Add(cst);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Teacher assigned successfully." });
        }

        [HttpPost("assign-student")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> AssignStudent([FromBody] AssignStudentDto request)
        {
            var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.StudentId && u.Role == UserRoles.Student);
            if (student == null) return BadRequest(new { message = "Student not found or user is not a student." });

            var classCourse = await _context.ClassCourses.FindAsync(request.ClassCourseId);
            if (classCourse == null) return NotFound(new { message = "Class not found." });

            var existing = await _context.ClassStudents.FirstOrDefaultAsync(cs =>
                cs.ClassCourseId == request.ClassCourseId &&
                cs.StudentId == request.StudentId);

            if (existing != null) return BadRequest(new { message = "Student is already enrolled in this class." });

            var csNew = new ClassStudent
            {
                ClassCourseId = request.ClassCourseId,
                StudentId = request.StudentId
            };

            _context.ClassStudents.Add(csNew);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Student assigned to class successfully." });
        }

        [HttpGet("assignments-matrix")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> GetClassTeacherSubjectsMatrix()
        {
            var list = await _context.ClassSubjectTeachers
                .Include(c => c.ClassCourse)
                .Include(s => s.Subject)
                .Include(t => t.Teacher)
                .Select(cst => new ClassTeacherSubjectDetailsDto(
                    cst.Id,
                    cst.ClassCourseId,
                    cst.ClassCourse!.Name,
                    cst.SubjectId,
                    cst.Subject!.Name,
                    cst.TeacherId,
                    cst.Teacher!.FullName
                ))
                .ToListAsync();

            return Ok(list);
        }
    }
}
