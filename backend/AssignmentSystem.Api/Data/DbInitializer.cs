using AssignmentSystem.Api.Models;
using BCrypt.Net;

namespace AssignmentSystem.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Users.Any())
            {
                return; // DB already seeded
            }

            // Seed Users
            var admin = new User
            {
                FullName = "System Administrator",
                Email = "admin@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = UserRoles.Admin,
                CreatedAt = DateTime.UtcNow
            };

            var teacher1 = new User
            {
                FullName = "Dr. Robert Smith",
                Email = "teacher@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher@123"),
                Role = UserRoles.Teacher,
                CreatedAt = DateTime.UtcNow
            };

            var teacher2 = new User
            {
                FullName = "Prof. Sarah Jenkins",
                Email = "teacher2@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher@123"),
                Role = UserRoles.Teacher,
                CreatedAt = DateTime.UtcNow
            };

            var student1 = new User
            {
                FullName = "Alex Johnson",
                Email = "student@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
                Role = UserRoles.Student,
                CreatedAt = DateTime.UtcNow
            };

            var student2 = new User
            {
                FullName = "Emily Davis",
                Email = "student2@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
                Role = UserRoles.Student,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(admin, teacher1, teacher2, student1, student2);
            context.SaveChanges();

            // Seed Classes
            var class1 = new ClassCourse
            {
                Name = "Class 10 - Science",
                Code = "CLS10-SCI",
                Description = "High school 10th grade science department stream.",
                CreatedAt = DateTime.UtcNow
            };

            var class2 = new ClassCourse
            {
                Name = "Class 11 - Commerce",
                Code = "CLS11-COM",
                Description = "Higher secondary 11th grade business and commerce stream.",
                CreatedAt = DateTime.UtcNow
            };

            context.ClassCourses.AddRange(class1, class2);
            context.SaveChanges();

            // Seed Subjects
            var phy = new Subject { Name = "Physics", Code = "PHY101", CreatedAt = DateTime.UtcNow };
            var math = new Subject { Name = "Mathematics", Code = "MATH101", CreatedAt = DateTime.UtcNow };
            var acc = new Subject { Name = "Accounting", Code = "ACC101", CreatedAt = DateTime.UtcNow };

            context.Subjects.AddRange(phy, math, acc);
            context.SaveChanges();

            // Assign Teachers to Classes & Subjects
            context.ClassSubjectTeachers.AddRange(
                new ClassSubjectTeacher { ClassCourseId = class1.Id, SubjectId = phy.Id, TeacherId = teacher1.Id },
                new ClassSubjectTeacher { ClassCourseId = class1.Id, SubjectId = math.Id, TeacherId = teacher1.Id },
                new ClassSubjectTeacher { ClassCourseId = class2.Id, SubjectId = acc.Id, TeacherId = teacher2.Id }
            );

            // Enroll Students in Classes
            context.ClassStudents.AddRange(
                new ClassStudent { ClassCourseId = class1.Id, StudentId = student1.Id },
                new ClassStudent { ClassCourseId = class1.Id, StudentId = student2.Id },
                new ClassStudent { ClassCourseId = class2.Id, StudentId = student2.Id }
            );
            context.SaveChanges();

            // Seed Assignments
            var assignment1 = new Assignment
            {
                Title = "Newton's Laws of Motion Application",
                Description = "Analyze real-world scenarios demonstrating Newton's 1st, 2nd, and 3rd laws. Provide calculations for a 1500kg car accelerating at 3 m/s².",
                ClassCourseId = class1.Id,
                SubjectId = phy.Id,
                TeacherId = teacher1.Id,
                Deadline = DateTime.UtcNow.AddDays(5),
                MaxMarks = 100,
                Status = AssignmentStatus.Published,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            };

            var assignment2 = new Assignment
            {
                Title = "Calculus Derivatives & Integration",
                Description = "Solve problem set #4 covering differential calculus applications in velocity and acceleration vectors.",
                ClassCourseId = class1.Id,
                SubjectId = math.Id,
                TeacherId = teacher1.Id,
                Deadline = DateTime.UtcNow.AddDays(10),
                MaxMarks = 50,
                Status = AssignmentStatus.Published,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            };

            var assignment3 = new Assignment
            {
                Title = "Quantum Mechanics Research Paper",
                Description = "Draft assignment on wave-particle duality and double-slit experiment analysis.",
                ClassCourseId = class1.Id,
                SubjectId = phy.Id,
                TeacherId = teacher1.Id,
                Deadline = DateTime.UtcNow.AddDays(14),
                MaxMarks = 100,
                Status = AssignmentStatus.Draft,
                CreatedAt = DateTime.UtcNow
            };

            var assignment4 = new Assignment
            {
                Title = "Basic Kinematics Quiz",
                Description = "Past deadline assignment covering scalar vs vector quantities, displacement, and constant acceleration equations.",
                ClassCourseId = class1.Id,
                SubjectId = phy.Id,
                TeacherId = teacher1.Id,
                Deadline = DateTime.UtcNow.AddDays(-2), // Past deadline
                MaxMarks = 20,
                Status = AssignmentStatus.Published,
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            };

            context.Assignments.AddRange(assignment1, assignment2, assignment3, assignment4);
            context.SaveChanges();

            // Seed Submissions
            var submission1 = new Submission
            {
                AssignmentId = assignment1.Id,
                StudentId = student1.Id,
                SubmissionContent = "Here is my response on Newton's Laws:\n1. First Law (Inertia): A body remains at rest unless acted upon by net external force.\n2. Second Law (F = ma): Force for 1500kg car at 3 m/s² = 1500 * 3 = 4500 N.\n3. Third Law (Action-Reaction): Tires push backward on road, road pushes forward on car.",
                AttachmentUrl = "https://example.com/files/newton_laws_alex.pdf",
                SubmittedAt = DateTime.UtcNow.AddDays(-1),
                Score = 95,
                Feedback = "Excellent calculations and clear real-world examples! Great work Alex.",
                Status = SubmissionStatus.Graded
            };

            var submission2 = new Submission
            {
                AssignmentId = assignment2.Id,
                StudentId = student2.Id,
                SubmissionContent = "Completed solutions for problem set #4. Integration steps included in attached document.",
                AttachmentUrl = "https://example.com/files/calculus_emily.pdf",
                SubmittedAt = DateTime.UtcNow.AddHours(-3),
                Score = null,
                Feedback = null,
                Status = SubmissionStatus.Submitted
            };

            context.Submissions.AddRange(submission1, submission2);
            context.SaveChanges();
        }
    }
}
