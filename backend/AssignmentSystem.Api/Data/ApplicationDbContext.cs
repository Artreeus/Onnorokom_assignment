using AssignmentSystem.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<ClassCourse> ClassCourses => Set<ClassCourse>();
        public DbSet<Subject> Subjects => Set<Subject>();
        public DbSet<ClassSubjectTeacher> ClassSubjectTeachers => Set<ClassSubjectTeacher>();
        public DbSet<ClassStudent> ClassStudents => Set<ClassStudent>();
        public DbSet<Assignment> Assignments => Set<Assignment>();
        public DbSet<Submission> Submissions => Set<Submission>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Email Unique
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // ClassSubjectTeacher relationships
            modelBuilder.Entity<ClassSubjectTeacher>()
                .HasOne(cst => cst.ClassCourse)
                .WithMany(c => c.SubjectTeachers)
                .HasForeignKey(cst => cst.ClassCourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ClassSubjectTeacher>()
                .HasOne(cst => cst.Subject)
                .WithMany(s => s.ClassTeachers)
                .HasForeignKey(cst => cst.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ClassSubjectTeacher>()
                .HasOne(cst => cst.Teacher)
                .WithMany(u => u.TeachingAssignments)
                .HasForeignKey(cst => cst.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            // ClassStudent relationships
            modelBuilder.Entity<ClassStudent>()
                .HasOne(cs => cs.ClassCourse)
                .WithMany(c => c.EnrolledStudents)
                .HasForeignKey(cs => cs.ClassCourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ClassStudent>()
                .HasOne(cs => cs.Student)
                .WithMany(u => u.EnrolledClasses)
                .HasForeignKey(cs => cs.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Assignment relationships
            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.ClassCourse)
                .WithMany(c => c.Assignments)
                .HasForeignKey(a => a.ClassCourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Subject)
                .WithMany(s => s.Assignments)
                .HasForeignKey(a => a.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Teacher)
                .WithMany(u => u.CreatedAssignments)
                .HasForeignKey(a => a.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            // Submission relationships
            modelBuilder.Entity<Submission>()
                .HasOne(s => s.Assignment)
                .WithMany(a => a.Submissions)
                .HasForeignKey(s => s.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Submission>()
                .HasOne(s => s.Student)
                .WithMany(u => u.Submissions)
                .HasForeignKey(s => s.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
