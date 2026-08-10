namespace AssignmentSystem.Api.Models
{
    // Relationship mapping: Which teacher teaches which Subject in which Class/Course
    public class ClassSubjectTeacher
    {
        public int Id { get; set; }

        public int ClassCourseId { get; set; }
        public ClassCourse? ClassCourse { get; set; }

        public int SubjectId { get; set; }
        public Subject? Subject { get; set; }

        public int TeacherId { get; set; }
        public User? Teacher { get; set; }
    }

    // Relationship mapping: Which student belongs to which Class/Course
    public class ClassStudent
    {
        public int Id { get; set; }

        public int ClassCourseId { get; set; }
        public ClassCourse? ClassCourse { get; set; }

        public int StudentId { get; set; }
        public User? Student { get; set; }
    }
}
