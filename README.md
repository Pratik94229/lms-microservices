# LMS Microservices

A full-stack Learning Management System built using Spring Boot microservices and React.

The application provides course management, video-based lessons, quizzes, student progress tracking, analytics, role-based access control, and PayPal payments.

---

## 🚀 Live Application

**Frontend:**
https://lms-microservices-zeta.vercel.app/

**API Gateway:**
https://lms-api-gateway-9lpv.onrender.com/

---

## 🔄 Wake Up Backend Services Before Using the Application

Since the backend services are deployed on **Render's free tier**, they may go to sleep after a period of inactivity.

**For the best experience, please click each of the following service links once before using the application.** This helps wake up the backend services.

| Service               | Link                                       |
| --------------------- | ------------------------------------------ |
| 🧭 **Eureka Server**  | https://lms-eureka-server.onrender.com     |
| 👤 **User Service**   | https://lms-user-service-kunt.onrender.com |
| 📚 **Course Service** | https://lms-microservices.onrender.com     |
| 📝 **Quiz Service**   | https://lms-quiz-service.onrender.com      |
| 🚪 **API Gateway**    | https://lms-api-gateway-9lpv.onrender.com  |

### Recommended Startup Order

Please open the services in the following order:

**1. Eureka Server**
https://lms-eureka-server.onrender.com

⬇️

**2. User Service**
https://lms-user-service-kunt.onrender.com

⬇️

**3. Course Service**
https://lms-microservices.onrender.com

⬇️

**4. Quiz Service**
https://lms-quiz-service.onrender.com

⬇️

**5. API Gateway**
https://lms-api-gateway-9lpv.onrender.com

⬇️

**6. Open the Frontend**
https://lms-microservices-zeta.vercel.app/

> **Note:** The Render service pages may display an error, JSON response, or a simple message when opened directly. That is normal. The purpose of opening them is to trigger the Render services to wake up.

### ⏳ Please Wait for Startup

After clicking the service links, **wait a few minutes for the backend services to fully start** before using the frontend.

The first request can be slow because the Render services need to wake up from an inactive state.

Once the services are running, open the frontend and follow:

```text
Open Backend Service Links
          ↓
Wait for Services to Wake Up
          ↓
Open Frontend
          ↓
Register
          ↓
Login
          ↓
Browse Courses
          ↓
Use the Application
```


---

# ⚠️ Important: Render Startup Disclaimer

This application is deployed using the **free tier of Render**.

Render free-tier services may go to sleep after a period of inactivity. Because of this, the first request after inactivity can take some time while the backend services wake up.

### If the application appears slow or does not respond immediately:

1. Open the application.
2. Wait for the backend services to wake up.
3. Refresh the page if necessary.
4. Try the operation again.

Once the services are awake, the application should respond normally.

> **Please allow some time for the backend services to start before assuming there is an application error.**

---

# ✨ Features

## 🔐 Authentication and Authorization

* Custom JWT-based authentication
* Username and password login
* BCrypt password hashing
* JWT-based authorization
* Stateless backend authentication
* Role-based access control
* Student, Instructor, and Admin roles
* Protected frontend routes
* Independent JWT validation in backend services
* Shared JWT secret across backend services

---

## 👨‍🎓 Student Features

* Register and login
* Browse published courses
* View course details
* Purchase courses using PayPal
* Automatic enrollment after successful payment
* View enrolled courses
* Watch course videos
* Track lesson completion
* Track course progress
* Complete courses
* Attempt quizzes
* View quiz results
* View profile information

---

## 👨‍🏫 Instructor Features

* Create courses
* Update courses
* Delete courses
* Publish courses
* Create sections
* Update sections
* Delete sections
* Create lessons
* Update lessons
* Delete lessons
* Upload course videos to Cloudinary
* Manage quizzes
* Manage quiz questions
* View course analytics

---

## 👨‍💼 Admin Features

* View users
* View user details
* Change user roles
* Delete users
* Manage platform users

---

## 💳 Payment Features

* PayPal Sandbox integration
* PayPal order creation
* PayPal checkout
* Server-side payment capture
* Payment records stored in MongoDB
* Automatic enrollment after successful payment
* Duplicate payment capture protection
* Idempotent payment processing

---

# 📖 How to Use the Application

## 1. Register First

When using the application for the first time, you need to create an account.

Open the application:

**https://lms-microservices-zeta.vercel.app/**

Go to the **Register** page.

Enter:

* Username
* Email
* Password
* First Name
* Last Name
* Phone Number

Submit the registration form.

After successful registration, the new account is automatically assigned the:

```text
STUDENT
```

role.

---

## 2. Login

After registration, go to the **Login** page.

Enter:

```text
Username
Password
```

After successful login, the backend generates a JWT access token.

The frontend uses this token when making authenticated API requests.

The basic authentication flow is:

```text
Register
   ↓
Login
   ↓
JWT Token
   ↓
Access Application
```

---

## 3. Browse Courses

After logging in as a student:

1. Open **Courses**.
2. Browse the available published courses.
3. Select a course.
4. View the course description, price, sections, and lessons.

---

## 4. Purchase a Course

For a paid course:

1. Open the course details.
2. Click the purchase option.
3. Complete the payment using **PayPal Sandbox**.
4. The backend processes the payment.
5. After successful payment, the student is automatically enrolled.

The payment flow is:

```text
Student
   ↓
Course
   ↓
PayPal Order
   ↓
PayPal Sandbox
   ↓
Payment Approval
   ↓
Server-side Payment Capture
   ↓
Payment Record
   ↓
Automatic Enrollment
```

> **Note:** PayPal is configured in Sandbox mode for testing. No real payment is processed.

---

## 5. Access My Courses

After successful enrollment:

1. Open **My Courses**.
2. Select the enrolled course.
3. Open sections and lessons.
4. Watch the course videos.
5. Mark lessons as completed.

The application tracks the student's course progress.

---

## 6. Attempt Quizzes

If a course contains a quiz:

1. Open the course.
2. Open the quiz.
3. Click **Start Quiz**.
4. Answer the questions.
5. Submit the quiz.
6. View the quiz result.

Quiz attempts, answers, and results are stored in the backend.

---

# 🎯 Complete Student Demo Flow

For demonstrating the complete application:

```text
Register
   ↓
Login
   ↓
Browse Courses
   ↓
Open Course
   ↓
Purchase Course
   ↓
PayPal Sandbox Payment
   ↓
Automatic Enrollment
   ↓
My Courses
   ↓
Watch Lessons
   ↓
Track Progress
   ↓
Attempt Quiz
   ↓
View Quiz Result
```

---

# 👨‍🏫 Instructor Demo Flow

An instructor can:

```text
Login as Instructor
        ↓
Create Course
        ↓
Add Sections
        ↓
Add Lessons
        ↓
Upload Videos
        ↓
Publish Course
        ↓
Create Quiz
        ↓
Add Questions
        ↓
View Analytics
```

---

# 👨‍💼 Admin Demo Flow

An administrator can:

```text
Login as Admin
      ↓
View Users
      ↓
View User Details
      ↓
Change User Role
      ↓
Manage Users
```

---

# 👥 User Roles

The application supports three roles.

## Student

Newly registered users are automatically assigned the `STUDENT` role.

Students can:

* Browse courses
* Purchase courses
* Enroll in courses
* Watch lessons
* Track progress
* Attempt quizzes
* View quiz results
* Manage their profile

---

## Instructor

Instructors can:

* Create courses
* Edit courses
* Delete courses
* Publish courses
* Create sections
* Create lessons
* Upload videos
* Create quizzes
* Manage quiz questions
* View course analytics

An administrator can change a user's role to `INSTRUCTOR`.

---

## Admin

Administrators can:

* View all users
* View user details
* Change user roles
* Delete users
* Manage platform users

---

# 🏗️ Architecture

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
      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
      │ User Service│      │Course Service│      │ Quiz Service │
      │    :8081    │      │    :8082     │      │    :8083     │
      │ JWT + BCrypt│      │ JWT Validate │      │ JWT Validate │
      └──────┬──────┘      └──────┬──────┘      └──────┬──────┘
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
```

---

# 🔧 Microservices

## User Service

Responsible for:

* User registration
* User login
* JWT generation
* Password hashing
* User profiles
* Role management
* Admin user management

Port:

```text
8081
```

---

## Course Service

Responsible for:

* Course management
* Sections
* Lessons
* Video uploads
* Enrollments
* Student progress
* Payments
* Course analytics

Port:

```text
8082
```

---

## Quiz Service

Responsible for:

* Quiz management
* Quiz questions
* Quiz attempts
* Quiz answers
* Quiz submission
* Quiz results

Port:

```text
8083
```

---

## API Gateway

The API Gateway provides a single entry point for the frontend and routes requests to the appropriate microservice.

Port:

```text
8080
```

---

## Eureka Server

Eureka provides service discovery between the microservices.

Port:

```text
8761
```

---

# 🔐 Authentication Flow

The application uses custom JWT authentication.

## Registration

```text
User
 │
 │ Register
 ▼
User Service
 │
 │ BCrypt Password Hashing
 ▼
MongoDB
```

## Login

```text
User
 │
 │ Username + Password
 ▼
User Service
 │
 │ Validate Credentials
 ▼
JWT Token
 │
 ▼
React Frontend
 │
 │ Authorization: Bearer <JWT>
 ▼
API Gateway
 │
 ├──────────────► User Service
 │
 ├──────────────► Course Service
 │
 └──────────────► Quiz Service
```

Each backend service independently validates the JWT using the shared JWT secret.

---

# 🗄️ Database

The application uses MongoDB for persistent data.

```text
MongoDB Atlas
│
├── User Database
├── Course Database
└── Quiz Database
```

User passwords are stored using BCrypt hashing and are not stored as plain-text passwords.

---

# 💳 Payment Architecture

The application uses PayPal Sandbox for payment testing.

```text
Student
   │
   ▼
Course Page
   │
   ▼
Create PayPal Order
   │
   ▼
PayPal Sandbox
   │
   ▼
Payment Approval
   │
   ▼
Server-side Capture
   │
   ▼
Payment Record
   │
   ▼
Automatic Enrollment
```

The backend performs server-side payment capture and protects against duplicate payment processing.

---

# 🛠️ Technology Stack

## Frontend

* React
* Vite
* JavaScript
* Axios
* React Router
* Tailwind CSS

## Backend

* Java 17
* Spring Boot
* Spring Security
* Spring Cloud
* Spring Cloud Gateway
* Spring Cloud Netflix Eureka
* Spring Cloud OpenFeign
* JWT
* BCrypt
* Maven

## Database

* MongoDB
* MongoDB Atlas

## External Services

* Cloudinary
* PayPal Sandbox
* Render
* Vercel

---

# 📁 Project Structure

```text
lms-microservices/
│
├── api-gateway/
├── eureka-server/
├── user-service/
├── course-service/
├── quiz-service/
├── lms-frontend/
│
├── docker-compose.yml
├── .env
├── .gitignore
└── README.md
```

---

# 💻 Running the Project Locally

## Prerequisites

Install:

* Java 17
* Maven
* Node.js
* npm
* Git
* MongoDB or MongoDB Atlas

---

## Clone the Repository

```bash
git clone https://github.com/Pratik94229/lms-microservices.git
cd lms-microservices
```

---

## Configure Environment Variables

Create a `.env` file and configure the required environment variables:

```text
MONGODB_URI=
MONGODB_COURSE_URI=
MONGODB_QUIZ_URI=

JWT_SECRET=
JWT_EXPIRATION_MS=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

PAYPAL_MODE=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

EUREKA_SERVER_URL=
```

> **Security:** Never commit `.env` files, passwords, API keys, JWT secrets, or other credentials to GitHub.

---

# ▶️ Start the Backend

Start the services in the following order:

```text
1. Eureka Server
2. User Service
3. Course Service
4. Quiz Service
5. API Gateway
```

The default ports are:

```text
Eureka Server  → 8761
User Service   → 8081
Course Service → 8082
Quiz Service   → 8083
API Gateway    → 8080
```

---

# ▶️ Start the Frontend

Navigate to the frontend:

```bash
cd lms-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# ☁️ Deployment

## Frontend

The React frontend is deployed using:

```text
Vercel
```

Live frontend:

```text
https://lms-microservices-zeta.vercel.app/
```

---

## Backend

The Spring Boot microservices are deployed using:

```text
Render
```

The backend consists of:

```text
Eureka Server
User Service
Course Service
Quiz Service
API Gateway
```

---

## Database

MongoDB is hosted using:

```text
MongoDB Atlas
```

---

## Video Storage

Course videos are stored using:

```text
Cloudinary
```

---

## Payments

Payments are configured using:

```text
PayPal Sandbox
```

---

# 🔒 Security

The application implements:

* JWT authentication
* BCrypt password hashing
* Stateless authentication
* Role-based authorization
* Protected API endpoints
* Protected frontend routes
* Independent JWT validation across microservices
* Shared JWT secret across backend services
* Server-side PayPal payment capture
* Idempotent payment processing
* Environment variables for sensitive configuration

Sensitive credentials should never be committed to the repository.

---

# ⚠️ Deployment Limitations

Because this project uses free-tier deployment services:

* Backend services may sleep after inactivity.
* The first request can take longer while services wake up.
* API Gateway requests may temporarily take longer during service startup.
* Render free-tier resources have limited performance.
* PayPal is configured for Sandbox/testing.
* Application availability depends on free-tier service limits.

### If the application takes time to load

Please wait for the backend services to wake up and then refresh the application.

This is expected behavior for the current free-tier deployment and does not necessarily indicate a problem with the application.

---

# 📌 Disclaimer

This project is developed for **educational, demonstration, and portfolio purposes**.

The live application uses free-tier cloud services and PayPal Sandbox. Therefore, startup time, performance, availability, and response times may vary.

For the best demonstration experience:

```text
Open Application
      ↓
Wait for Render Services
      ↓
Register
      ↓
Login
      ↓
Use the Application
```

---

# 👨‍💻 Author

**Pratik Thorat**

GitHub Repository:

https://github.com/Pratik94229/lms-microservices
