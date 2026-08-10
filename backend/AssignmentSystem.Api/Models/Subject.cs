using System.ComponentModel.DataAnnotations;

namespace AssignmentSystem.Api.Models
{
    public class Subject
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty; // e.g. "Physics", "Mathematics"

        [Required, MaxLength(50)]
        public string Code { get; set; } = string.Empty; // e.g. "PHY101"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<ClassSubjectTeacher> ClassTeachers { get; set; } = new List<ClassSubjectTeacher>();
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    }
}
