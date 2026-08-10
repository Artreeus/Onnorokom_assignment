-- SQL Schema & Sample Data Script for Assignment & Submission Management System
-- Compatible with PostgreSQL & SQLite

-- 1. Users Table
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "FullName" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(150) NOT NULL UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "Role" VARCHAR(20) NOT NULL,
    "CreatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ClassCourses Table
CREATE TABLE IF NOT EXISTS "ClassCourses" (
    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "Name" VARCHAR(100) NOT NULL,
    "Code" VARCHAR(50) NOT NULL UNIQUE,
    "Description" TEXT,
    "CreatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS "Subjects" (
    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "Name" VARCHAR(100) NOT NULL,
    "Code" VARCHAR(50) NOT NULL UNIQUE,
    "CreatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. ClassSubjectTeachers Mapping Table
CREATE TABLE IF NOT EXISTS "ClassSubjectTeachers" (
    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "ClassCourseId" INTEGER NOT NULL,
    "SubjectId" INTEGER NOT NULL,
    "TeacherId" INTEGER NOT NULL,
    FOREIGN KEY ("ClassCourseId") REFERENCES "ClassCourses"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("SubjectId") REFERENCES "Subjects"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("TeacherId") REFERENCES "Users"("Id") ON DELETE RESTRICT
);

-- 5. ClassStudents Mapping Table
CREATE TABLE IF NOT EXISTS "ClassStudents" (
    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "ClassCourseId" INTEGER NOT NULL,
    "StudentId" INTEGER NOT NULL,
    FOREIGN KEY ("ClassCourseId") REFERENCES "ClassCourses"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("StudentId") REFERENCES "Users"("Id") ON DELETE RESTRICT
);

-- 6. Assignments Table
CREATE TABLE IF NOT EXISTS "Assignments" (
    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT NOT NULL,
    "ClassCourseId" INTEGER NOT NULL,
    "SubjectId" INTEGER NOT NULL,
    "TeacherId" INTEGER NOT NULL,
    "Deadline" DATETIME NOT NULL,
    "MaxMarks" INTEGER NOT NULL DEFAULT 100,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Draft',
    "CreatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" DATETIME,
    FOREIGN KEY ("ClassCourseId") REFERENCES "ClassCourses"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("SubjectId") REFERENCES "Subjects"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("TeacherId") REFERENCES "Users"("Id") ON DELETE RESTRICT
);

-- 7. Submissions Table
CREATE TABLE IF NOT EXISTS "Submissions" (
    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "AssignmentId" INTEGER NOT NULL,
    "StudentId" INTEGER NOT NULL,
    "SubmissionContent" TEXT NOT NULL,
    "AttachmentUrl" TEXT,
    "SubmittedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" DATETIME,
    "Score" REAL,
    "Feedback" TEXT,
    "Status" VARCHAR(30) NOT NULL DEFAULT 'Submitted',
    FOREIGN KEY ("AssignmentId") REFERENCES "Assignments"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("StudentId") REFERENCES "Users"("Id") ON DELETE RESTRICT
);
