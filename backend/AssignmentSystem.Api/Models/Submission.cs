using System.ComponentModel.DataAnnotations;

namespace AssignmentSystem.Api.Models
{
    public static class SubmissionStatus
    {
        public const string Submitted = "Submitted";
        public const string Graded = "Graded";
        public const string NeedsRevision = "NeedsRevision";
    }

    public class Submission
    {
        public int Id { get; set; }

        public int AssignmentId { get; set; }
        public Assignment? Assignment { get; set; }

        public int StudentId { get; set; }
        public User? Student { get; set; }

        [Required]
        public string SubmissionContent { get; set; } = string.Empty;

        public string? AttachmentUrl { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public double? Score { get; set; } // Graded mark out of Assignment.MaxMarks

        public string? Feedback { get; set; }

        [Required, MaxLength(30)]
        public string Status { get; set; } = SubmissionStatus.Submitted; // Submitted, Graded, NeedsRevision
    }
}
