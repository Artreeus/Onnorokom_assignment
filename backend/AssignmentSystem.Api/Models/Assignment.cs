using System.ComponentModel.DataAnnotations;

namespace AssignmentSystem.Api.Models
{
    public static class AssignmentStatus
    {
        public const string Draft = "Draft";
        public const string Published = "Published";
    }

    public class Assignment
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public int ClassCourseId { get; set; }
        public ClassCourse? ClassCourse { get; set; }

        public int SubjectId { get; set; }
        public Subject? Subject { get; set; }

        public int TeacherId { get; set; }
        public User? Teacher { get; set; }

        public DateTime Deadline { get; set; }

        public int MaxMarks { get; set; } = 100;

        [Required, MaxLength(20)]
        public string Status { get; set; } = AssignmentStatus.Draft; // Draft, Published

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}
