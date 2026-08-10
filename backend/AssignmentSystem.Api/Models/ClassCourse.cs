using System.ComponentModel.DataAnnotations;

namespace AssignmentSystem.Api.Models
{
    public class ClassCourse
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty; // e.g. "Class 10 - Science", "CSE 101"

        [Required, MaxLength(50)]
        public string Code { get; set; } = string.Empty; // e.g. "CLS10-SCI", "CSE101"

        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<ClassSubjectTeacher> SubjectTeachers { get; set; } = new List<ClassSubjectTeacher>();
        public ICollection<ClassStudent> EnrolledStudents { get; set; } = new List<ClassStudent>();
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    }
}
