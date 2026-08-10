# 📚 Assignment & Submission Management System

A full-stack, role-based Web Application built for schools and colleges to manage academic assignments, student submissions, evaluation, and grading.

---

## 🌐 Live Production Deployments

| Component | Platform | Live Production URL |
| :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** | [https://frontend-sigma-rouge-63.vercel.app](https://frontend-sigma-rouge-63.vercel.app) |
| **Backend RESTful API** | **Railway** | [https://assignment-submission-api-production.up.railway.app/api](https://assignment-submission-api-production.up.railway.app/api) |
| **Swagger OpenAPI Docs** | **Railway** | [https://assignment-submission-api-production.up.railway.app/swagger](https://assignment-submission-api-production.up.railway.app/swagger) |

---

## 🌟 Key Features & Capabilities

### 👑 Admin Role
* **User Management**: Create, update, list, and delete accounts for Admins, Teachers, and Students.
* **Class & Course Management**: Define academic classes/courses (e.g. *Class 10 - Science*, *Class 11 - Commerce*).
* **Subject Management**: Manage academic subjects (e.g. *Physics*, *Mathematics*, *Accounting*).
* **Academic Matrix Assignment**: Assign teachers to teach specific subjects within specific classes, and enroll students into classes.
* **Global Visibility**: View all system assignments and student submissions across all classes.

### 👨‍🏫 Teacher Role
* **Assignment Management**: Create, edit, and delete assignments with title, instructions, subject, class, deadline, and maximum marks.
* **Publishing Workflow**: Toggle assignment status between **Draft** (hidden from students) and **Published**.
* **Submissions Inbox**: View all submissions submitted by students for each assignment.
* **Grading & Feedback**: Assign numerical scores (validated $0 \le score \le maxMarks$), write feedback, and update submission status (*Graded* or *Needs Revision*).

### 🎓 Student Role
* **Coursework Feed**: View published assignments for enrolled classes.
* **Deadline Tracking**: Live deadline status indicator (Active vs Overdue).
* **Answer Submission**: Submit text solutions and optional file/URL attachments before the deadline.
* **Edit Before Deadline**: Update answers prior to the deadline cutoff.
* **Grade & Feedback Viewer**: View scores, percentage scores, and teacher comments once evaluated.

---

## 🔐 Demo Login Credentials

You can log in directly using the credentials below or click the **1-Click Evaluator Demo Cards** on the login page:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@school.com` | `Admin@123` | Full administrative control |
| **Teacher** | `teacher@school.com` | `Teacher@123` | Create assignments & grade submissions |
| **Student** | `student@school.com` | `Student@123` | Submit answers & view feedback |

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Axios |
| **Backend API** | ASP.NET Core 8.0 Web API, C#, RESTful Architecture |
| **Database** | Entity Framework Core 8.0, SQLite (Zero-config local DB) / PostgreSQL supported |
| **Authentication** | JWT (JSON Web Tokens) with Role Claims (`Admin`, `Teacher`, `Student`) |
| **Testing** | xUnit, FluentAssertions, Moq, EF Core InMemory Provider |
| **Deployment** | Vercel (Frontend), Railway (Backend), Docker & Docker Compose |

---

## 📂 Project Structure

```
g:/onnorokom/
├── backend/
│   ├── AssignmentSystem.Api/               # ASP.NET Core 8.0 Web API
│   │   ├── Controllers/                    # REST API Controllers (Auth, Users, Classes, Assignments, Submissions)
│   │   ├── Data/                           # EF Core DbContext & Auto-Seeding (DbInitializer)
│   │   ├── DTOs/                           # Data Transfer Objects
│   │   ├── Models/                         # Domain Entities (User, ClassCourse, Subject, Assignment, Submission)
│   │   ├── Services/                       # JwtService & Auth token generation
│   │   ├── Dockerfile                      # Production Dockerfile for API
│   │   ├── Program.cs                      # Web API setup, CORS, Auth, Swagger UI
│   │   └── appsettings.json
│   ├── AssignmentSystem.Tests/             # xUnit Unit Test Project
│   │   ├── BusinessRuleTests.cs            # Deadline, draft status, and grade bounds validation
│   │   ├── SubmissionWorkflowTests.cs      # End-to-end assignment submit & grade lifecycle
│   │   └── AuthorizationTests.cs           # JWT claims & role assertions
│   └── database.sql                        # SQL Schema & seed data script
├── frontend/
│   ├── app/                                # Next.js 14 App Router Pages
│   │   ├── (auth)/login/                   # Login Page with 1-click Demo cards
│   │   ├── admin/                          # Admin Management Dashboard
│   │   ├── teacher/                        # Teacher Assignments & Grading Hub
│   │   ├── student/                        # Student Coursework & Submissions Portal
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/                         # Navbar, Sidebar, UI components
│   ├── lib/                                # API Axios client & AuthContext state
│   ├── Dockerfile                          # Production Dockerfile for Frontend
│   └── package.json
├── docker-compose.yml                      # 1-Command Docker Compose deployment
├── NuGet.Config                            # NuGet package source configuration
└── README.md
```

---

## 🚀 Local Setup & Quick Start

### 1. Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js v18+](https://nodejs.org/)

### 2. Running the Backend API
1. Navigate to the backend API directory:
   ```bash
   cd backend/AssignmentSystem.Api
   ```
2. Run the ASP.NET Core API server:
   ```bash
   dotnet run
   ```
   *The API will start at `http://localhost:5000`. Database tables and demo data are automatically created on startup.*
3. Open Swagger OpenAPI documentation:
   ```
   http://localhost:5000/swagger
   ```

### 3. Running Backend Unit Tests
To execute the automated xUnit tests covering business rules and authorization (Passed 6/6 tests):
```bash
cd backend/AssignmentSystem.Tests
dotnet test
```

### 4. Running the Frontend Application
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the web app in your browser:
   ```
   http://localhost:3000
   ```

---

## 🐳 Docker Deployment

To build and run both Frontend and Backend together using Docker Compose:
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## 🧪 Business Rules & Test Coverage

1. **Deadline Restrictions**: Submissions submitted after an assignment's deadline are automatically rejected by the backend API (`400 Bad Request`). Students cannot edit submissions after the deadline has passed.
2. **Draft Assignments Visibility**: Students cannot view or submit answers for assignments in `Draft` status. Only `Published` assignments are accessible to enrolled students.
3. **Marks Validation**: Score awarded by a teacher must be $0 \le score \le MaxMarks$. Scores exceeding maximum marks are rejected.
4. **Class Enrollment Enforcement**: Students can only view and submit assignments for classes they are enrolled in.

---

## 💡 Assumptions & Design Decisions

1. **Zero-Configuration Database**: Default setup uses EF Core SQLite (`assignments.db`) with automatic database creation and seeding on application startup. Evaluators can clone and run `dotnet run` without installing external database servers.
2. **Flexible Attachment URLs**: Students can attach external links (e.g. Google Drive, GitHub repo, PDF URLs) alongside text answers.
3. **Responsive Glassmorphism Design**: High-aesthetic, modern dark mode UI built with Tailwind CSS, Lucide icons, dynamic status badges, and glassmorphic cards.
