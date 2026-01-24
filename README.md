# UniverSys Lite

A comprehensive university management system built with .NET 8 and Angular 19. This full-stack application provides a modern, intuitive interface for managing students, courses, enrollments, grades, billing, and facility scheduling.

## Features

- **Student Management** - Complete student lifecycle management with academic tracking
- **Course Catalog** - Manage courses, prerequisites, and sections
- **Enrollment System** - Student course registration and enrollment tracking
- **Grade Management** - Grade entry, transcripts, and GPA calculations
- **Billing & Payments** - Tuition charges, payments, and financial holds
- **Room Scheduling** - Building and room management with scheduling
- **Notifications** - Real-time notification system with preferences
- **Role-Based Access** - Secure authentication with role-based permissions

## Tech Stack

### Backend
- .NET 8 Web API
- Entity Framework Core
- SQL Server
- JWT Authentication
- Clean Architecture (Domain, Application, Infrastructure, Presentation)

### Frontend
- Angular 19
- Angular Material
- TailwindCSS
- RxJS
- ngx-charts

## Screenshots

### Login
Modern login interface with university branding and secure authentication.

![Login](screenshots/1.png)

### Dashboard
Admin dashboard with key metrics, charts, and quick actions.

![Dashboard](screenshots/2.png)

### Student Management
Comprehensive student list with search, filters, and status indicators.

![Student List](screenshots/3.png)

### Student Profile
Detailed student view with personal, academic, and financial information.

![Student Detail](screenshots/4.png)

### Edit Student
Full-featured student edit form with validation.

![Edit Student](screenshots/5.png)

![Edit Student - Academic Info](screenshots/6.png)

### Course Catalog
Browse and manage courses with filtering by department, level, and credits.

![Course Catalog](screenshots/7.png)

### Course Details
Detailed course view with prerequisites and section information.

![Course Detail](screenshots/8.png)

### Enrollments
Track student enrollments with grades and completion status.

![Enrollments](screenshots/9.png)

### Enrollment Details
Individual enrollment view with student and course information.

![Enrollment Detail](screenshots/10.png)

### Grade Management
Section-based grade entry with grade distribution overview.

![Grade Management](screenshots/11.png)

### Billing Management
Student billing with charges, payments, and account balance tracking.

![Billing](screenshots/12.png)

### Settings & Profile
User profile management with account settings.

![Settings](screenshots/13.png)

### Room Management
Manage rooms across campus buildings with capacity and features.

![Room Management](screenshots/14.png)

### Building Management
Campus buildings overview with room counts and floor information.

![Buildings](screenshots/15.png)

### Notification Center
Real-time notifications with filtering and quick actions.

![Notifications](screenshots/16.png)

### Notification Preferences
Granular notification preferences for email, push, and in-app alerts.

![Notification Preferences](screenshots/17.png)

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- SQL Server (LocalDB or full instance)

### Backend Setup

```bash
cd src/Presentation/UniverSysLite.API
dotnet restore
dotnet run
```

The API will start at `http://localhost:5275`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The application will be available at `http://localhost:4200`

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@universyslite.edu | Admin@123! |

## Project Structure

```
UniverSysLite/
├── src/
│   ├── Core/
│   │   ├── UniverSysLite.Domain/        # Entities, enums, interfaces
│   │   └── UniverSysLite.Application/   # Use cases, DTOs, services
│   ├── Infrastructure/
│   │   └── UniverSysLite.Infrastructure/ # EF Core, repositories, external services
│   └── Presentation/
│       └── UniverSysLite.API/           # Controllers, middleware
├── frontend/                             # Angular application
│   └── src/app/
│       ├── core/                        # Auth, interceptors, services
│       └── features/                    # Feature modules
└── screenshots/                          # Application screenshots
```

## API Documentation

Swagger documentation is available at `http://localhost:5275/swagger` when running in development mode.

## License

This project is for demonstration and portfolio purposes.
