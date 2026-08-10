using System.ComponentModel.DataAnnotations;

namespace AssignmentSystem.Api.DTOs
{
    // Auth DTOs
    public record LoginDto([Required, EmailAddress] string Email, [Required] string Password);
    public record AuthResponseDto(string Token, UserDto User);
    public record UserDto(int Id, string FullName, string Email, string Role, DateTime CreatedAt);
    public record CreateUserDto([Required] string FullName, [Required, EmailAddress] string Email, [Required] string Password, [Required] string Role);
    public record UpdateUserDto(string FullName, string Email, string? Password, string Role);

    // Academic DTOs
    public record ClassCourseDto(int Id, string Name, string Code, string Description, int EnrolledStudentCount, int SubjectCount);
    public record CreateClassDto([Required] string Name, [Required] string Code, string Description);

    public record SubjectDto(int Id, string Name, string Code);
    public record CreateSubjectDto([Required] string Name, [Required] string Code);

    public record AssignTeacherDto(int ClassCourseId, int SubjectId, int TeacherId);
    public record AssignStudentDto(int ClassCourseId, int StudentId);

    public record ClassTeacherSubjectDetailsDto(int Id, int ClassCourseId, string ClassName, int SubjectId, string SubjectName, int TeacherId, string TeacherName);

    // Assignment DTOs
    public record AssignmentDto(
        int Id,
        string Title,
        string Description,
        int ClassCourseId,
        string ClassName,
        int SubjectId,
        string SubjectName,
        int TeacherId,
        string TeacherName,
        DateTime Deadline,
        int MaxMarks,
        string Status,
        DateTime CreatedAt,
        int SubmissionCount,
        bool IsOverdue
    );

    public record CreateAssignmentDto(
        [Required] string Title,
        [Required] string Description,
        [Required] int ClassCourseId,
        [Required] int SubjectId,
        [Required] DateTime Deadline,
        [Range(1, 1000)] int MaxMarks = 100,
        string Status = "Published"
    );

    public record UpdateAssignmentDto(
        string Title,
        string Description,
        int ClassCourseId,
        int SubjectId,
        DateTime Deadline,
        int MaxMarks,
        string Status
    );

    // Submission DTOs
    public record SubmissionDto(
        int Id,
        int AssignmentId,
        string AssignmentTitle,
        int MaxMarks,
        int StudentId,
        string StudentName,
        string StudentEmail,
        string SubmissionContent,
        string? AttachmentUrl,
        DateTime SubmittedAt,
        DateTime? UpdatedAt,
        double? Score,
        string? Feedback,
        string Status
    );

    public record CreateSubmissionDto(
        [Required] int AssignmentId,
        [Required] string SubmissionContent,
        string? AttachmentUrl
    );

    public record UpdateSubmissionDto(
        [Required] string SubmissionContent,
        string? AttachmentUrl
    );

    public record GradeSubmissionDto(
        [Range(0, 1000)] double Score,
        string? Feedback,
        string Status = "Graded" // Graded, NeedsRevision
    );
}
