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
    public class SubjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SubjectsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSubjects()
        {
            var subjects = await _context.Subjects
                .Select(s => new SubjectDto(s.Id, s.Name, s.Code))
                .ToListAsync();

            return Ok(subjects);
        }

        [HttpPost]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _context.Subjects.AnyAsync(s => s.Code.ToLower() == request.Code.ToLower());
            if (exists) return BadRequest(new { message = "Subject code already exists." });

            var subject = new Subject
            {
                Name = request.Name,
                Code = request.Code
            };

            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();

            return Ok(new SubjectDto(subject.Id, subject.Name, subject.Code));
        }
    }
}
