# LMS Microservices

A full-stack Learning Management System built using Spring Boot microservices and React.

The application provides course management, video-based lessons, quizzes, student progress tracking, analytics, role-based access control, and PayPal payments.

---

## Features

### Authentication and Authorization

- Custom JWT-based authentication
- Username and password login
- BCrypt password hashing
- JWT-based authorization
- Stateless backend authentication
- Role-based access control
- Student, Instructor, and Admin roles
- Protected frontend routes
- Independent JWT validation in backend services
- Shared JWT secret across backend services

### Student Features

- Register and login
- Browse published courses
- View course details
- Purchase courses using PayPal
- Automatic enrollment after successful payment
- View enrolled courses
- Watch course videos
- Track lesson completion
- Track course progress
- Complete courses
- Attempt quizzes
- View quiz results
- View profile information

### Instructor Features

- Create courses
- Update courses
- Delete courses
- Publish courses
- Create sections
- Update sections
- Delete sections
- Create lessons
- Update lessons
- Delete lessons
- Upload course videos to Cloudinary
- Manage quizzes
- Manage quiz questions
- View course analytics

### Admin Features

- View users
- View user details
- Change user roles
- Delete users
- Manage platform users

### Payment Features

- PayPal Sandbox integration
- PayPal order creation
- PayPal checkout
- Server-side payment capture
- Payment records stored in MongoDB
- Automatic enrollment after successful payment
- Duplicate payment capture protection
- Idempotent payment processing

---

## Architecture

```text
                         ┌─────────────────┐
                         │   React Client  │
                         │    Vite + JS    │
                         │     Vercel      │
                         └────────┬────────┘
                                  │
                             JWT Bearer
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   API Gateway   │
                         │     :8080       │
                         └────────┬────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
      ┌─────────────┐      ┌────────────-─┐      ┌─────────────--┐
      │ User Service│      │Course Service│      │ Quiz Service  │
      │    :8081    │      │    :8082     │      │    :8083      │
      │ JWT + BCrypt│      │ JWT Validate │      │ JWT Validate  │
      └──────┬──────┘      └──────┬──────-┘      └──────┬─────--─┘
             │                    │                     │
             ▼                    ▼                     ▼
        MongoDB User        MongoDB Course        MongoDB Quiz
                                  │
                                  ├── Cloudinary
                                  │
                                  └── PayPal

                         ┌─────────────────┐
                         │ Eureka Server   │
                         │     :8761       │
                         └─────────────────┘