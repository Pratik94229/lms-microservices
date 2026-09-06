import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Courses from "./components/Courses";
import Login from "./components/Login";
import Register from "./components/Register";
import CourseDetails from "./components/CourseDetails";
import Lesson from "./components/Lesson";
import MyLearning from "./components/MyLearning";
import ProtectedRoute from "./components/ProtectedRoute";
import InstructorDashboard from "./components/Instructor/InstructorDashboard";
import InstructorCourse from "./components/Instructor/InstructorCourse";
import InstructorCourseAnalytics from "./components/Instructor/InstructorCourseAnalytics";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminUserDetails from "./components/Admin/AdminUserDetails";
import StudentQuiz from "./components/StudentQuiz";
import QuizResult from "./components/QuizResult";
import Profile from "./components/Profile";
import PaymentSuccess from "./components/PaymentSuccess";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar />

        <Routes>
          {/* =====================================================
              PUBLIC PAGES
          ====================================================== */}

          <Route path="/" element={<Home />} />

          <Route path="/courses" element={<Courses />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/courses/:courseId" element={<CourseDetails />} />

          <Route path="/payment/success" element={<PaymentSuccess />} />

          {/* =====================================================
              PROTECTED LESSON PAGE
          ====================================================== */}

          <Route
            path="/courses/:courseId/lessons/:lessonId"
            element={
              <ProtectedRoute>
                <Lesson />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              PROTECTED LEARNING PAGE
          ====================================================== */}

          <Route
            path="/my-learning"
            element={
              <ProtectedRoute>
                <MyLearning />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              PROTECTED QUIZ RESULT PAGE
          ====================================================== */}

          <Route
            path="/quiz-results/:attemptId"
            element={
              <ProtectedRoute>
                <QuizResult />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              INSTRUCTOR
          ====================================================== */}

          <Route
            path="/instructor"
            element={
              <ProtectedRoute>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Course Analytics
              IMPORTANT:
              This route comes before the general course route.
          */}
          <Route
            path="/instructor/courses/:courseId/analytics"
            element={
              <ProtectedRoute>
                <InstructorCourseAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Instructor Course Management */}
          <Route
            path="/instructor/courses/:courseId"
            element={
              <ProtectedRoute>
                <InstructorCourse />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              ADMIN
          ====================================================== */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users/:userId"
            element={
              <ProtectedRoute>
                <AdminUserDetails />
              </ProtectedRoute>
            }
          />

          {/* =====================================================
              STUDENT QUIZ
          ====================================================== */}

          <Route
            path="/quizzes/:quizId"
            element={
              <ProtectedRoute>
                <StudentQuiz />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
