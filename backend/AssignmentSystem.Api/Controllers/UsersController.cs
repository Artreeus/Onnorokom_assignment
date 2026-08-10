using AssignmentSystem.Api.Data;
using AssignmentSystem.Api.DTOs;
using AssignmentSystem.Api.Models;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = UserRoles.Admin)]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? role)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(u => u.Role.ToLower() == role.ToLower());
            }

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserDto(u.Id, u.FullName, u.Email, u.Role, u.CreatedAt))
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            return Ok(new UserDto(user.Id, user.FullName, user.Email, user.Role, user.CreatedAt));
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (existing) return BadRequest(new { message = "Email already in use." });

            var validRoles = new[] { UserRoles.Admin, UserRoles.Teacher, UserRoles.Student };
            if (!validRoles.Contains(request.Role))
            {
                return BadRequest(new { message = "Invalid user role." });
            }

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, new UserDto(user.Id, user.FullName, user.Email, user.Role, user.CreatedAt));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            if (!string.IsNullOrWhiteSpace(request.Email) && request.Email.ToLower() != user.Email.ToLower())
            {
                var existing = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
                if (existing) return BadRequest(new { message = "Email already in use." });
                user.Email = request.Email;
            }

            if (!string.IsNullOrWhiteSpace(request.FullName)) user.FullName = request.FullName;
            if (!string.IsNullOrWhiteSpace(request.Role)) user.Role = request.Role;
            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            await _context.SaveChangesAsync();
            return Ok(new UserDto(user.Id, user.FullName, user.Email, user.Role, user.CreatedAt));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
