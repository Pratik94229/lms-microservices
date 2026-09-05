import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { isInstructor } from "../../utils/auth";

function InstructorCourseAnalytics() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [analytics, setAnalytics] = useState(null);

  const [students, setStudents] = useState([]);

  const [quizAnalytics, setQuizAnalytics] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD ANALYTICS
  // =========================================================

  useEffect(() => {
    // Only instructors can access course analytics.
    if (!isInstructor()) {
      navigate("/", {
        replace: true,
      });

      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        // -----------------------------------------------------
        // Load overall course analytics.
        // -----------------------------------------------------

        const analyticsResponse = await api.get(
          `/courses/${courseId}/analytics`,
        );

        // -----------------------------------------------------
        // Load individual student analytics.
        // -----------------------------------------------------

        const studentsResponse = await api.get(
          `/courses/${courseId}/analytics/students`,
        );

        // -----------------------------------------------------
        // Load quiz performance analytics.
        // -----------------------------------------------------

        const quizAnalyticsResponse = await api.get(
          `/quizzes/courses/${courseId}/analytics`,
        );

        setAnalytics(analyticsResponse.data);

        setStudents(studentsResponse.data);

        setQuizAnalytics(quizAnalyticsResponse.data);
      } catch (err) {
        console.error("Failed to load course analytics:", err);

        if (err.response?.status === 401) {
          setError("Your login session is invalid or expired.");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to view this course analytics.");
        } else if (err.response?.status === 404) {
          setError("Course not found.");
        } else {
          setError("Unable to load course analytics. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [courseId, navigate]);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // STUDENT STATUS
  // =========================================================

  const getStudentStatus = (student) => {
    if (student.completed) {
      return {
        label: "Completed",
        className: "bg-green-100 text-green-700",
      };
    }

    if (student.completedLessons > 0) {
      return {
        label: "In Progress",
        className: "bg-orange-100 text-orange-700",
      };
    }

    return {
      label: "Not Started",
      className: "bg-gray-100 text-gray-600",
    };
  };

  // =========================================================
  // QUIZ STATUS
  // =========================================================

  const getQuizStatus = (quiz) => {
    if (quiz.totalAttempts === 0) {
      return {
        label: "No Attempts",
        className: "bg-gray-100 text-gray-600",
      };
    }

    if (quiz.passRate >= 70) {
      return {
        label: "Good",
        className: "bg-green-100 text-green-700",
      };
    }

    if (quiz.passRate >= 40) {
      return {
        label: "Needs Attention",
        className: "bg-orange-100 text-orange-700",
      };
    }

    return {
      label: "Low Pass Rate",
      className: "bg-red-100 text-red-700",
    };
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-muted">Loading course analytics...</p>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-600">{error}</p>

            <Link
              to={`/instructor/courses/${courseId}`}
              className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Back to Course Management
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* =====================================================
            BACK LINK
        ====================================================== */}

        <Link
          to={`/instructor/courses/${courseId}`}
          className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
        >
          ← Back to Course Management
        </Link>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Instructor Analytics
          </p>

          <h1 className="mt-2 text-3xl font-bold text-dark">
            {analytics.courseTitle}
          </h1>

          <p className="mt-2 text-sm text-muted">
            Monitor student enrollment, course completion, and quiz performance.
          </p>
        </div>

        {/* =====================================================
            ANALYTICS CARDS
        ====================================================== */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Students */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">Total Students</p>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                👥
              </div>
            </div>

            <p className="mt-5 text-3xl font-bold text-dark">
              {analytics.totalStudents}
            </p>

            <p className="mt-1 text-sm text-muted">Enrolled students</p>
          </div>

          {/* Completed Students */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">Completed</p>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-lg">
                ✓
              </div>
            </div>

            <p className="mt-5 text-3xl font-bold text-green-600">
              {analytics.completedStudents}
            </p>

            <p className="mt-1 text-sm text-muted">Students completed</p>
          </div>

          {/* In Progress */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">In Progress</p>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-lg">
                ⏳
              </div>
            </div>

            <p className="mt-5 text-3xl font-bold text-orange-600">
              {analytics.inProgressStudents}
            </p>

            <p className="mt-1 text-sm text-muted">Students still learning</p>
          </div>

          {/* Completion Percentage */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">
                Completion Rate
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg">
                %
              </div>
            </div>

            <p className="mt-5 text-3xl font-bold text-primary">
              {analytics.completionPercentage.toFixed(1)}%
            </p>

            <p className="mt-1 text-sm text-muted">Overall completion</p>
          </div>
        </section>

        {/* =====================================================
            COMPLETION OVERVIEW
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Completion Overview
            </p>

            <h2 className="mt-1 text-xl font-bold text-dark">
              Student Progress
            </h2>

            <p className="mt-2 text-sm text-muted">
              Percentage of enrolled students who have completed the course.
            </p>
          </div>

          {/* Progress bar */}

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-dark">Completion</span>

              <span className="font-semibold text-primary">
                {analytics.completionPercentage.toFixed(1)}%
              </span>
            </div>

            <div className="mt-3 h-4 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${Math.min(
                    Math.max(analytics.completionPercentage, 0),
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Completion breakdown */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm font-medium text-green-700">
                Completed Students
              </p>

              <p className="mt-1 text-2xl font-bold text-green-700">
                {analytics.completedStudents}
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-sm font-medium text-orange-700">
                In Progress Students
              </p>

              <p className="mt-1 text-2xl font-bold text-orange-700">
                {analytics.inProgressStudents}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            STUDENT PROGRESS
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Section Header */}

          <div className="border-b border-gray-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Student Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-dark">
              Student Progress
            </h2>

            <p className="mt-2 text-sm text-muted">
              View individual progress for every student enrolled in this
              course.
            </p>
          </div>

          {/* No students */}

          {students.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted">
                No students are enrolled in this course yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Student
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Progress
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Lessons
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Enrolled
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => {
                    const status = getStudentStatus(student);

                    const progress = Math.min(
                      Math.max(student.progressPercentage || 0, 0),
                      100,
                    );

                    return (
                      <tr
                        key={student.studentId}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        {/* Student */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                              {student.studentUsername
                                ? student.studentUsername
                                    .charAt(0)
                                    .toUpperCase()
                                : "?"}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-dark">
                                {student.studentUsername}
                              </p>

                              <p className="truncate text-xs text-muted">
                                {student.studentEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Progress */}

                        <td className="px-6 py-5">
                          <div className="w-48">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-semibold text-dark">
                                {progress.toFixed(1)}%
                              </span>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  student.completed
                                    ? "bg-green-500"
                                    : "bg-primary"
                                }`}
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Lessons */}

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-dark">
                            {student.completedLessons}
                            {" / "}
                            {student.totalLessons}
                          </p>

                          <p className="mt-1 text-xs text-muted">
                            lessons completed
                          </p>
                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        {/* Enrollment Date */}

                        <td className="px-6 py-5">
                          <p className="text-sm font-medium text-dark">
                            {formatDate(student.enrolledAt)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =====================================================
            QUIZ PERFORMANCE
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Section Header */}

          <div className="border-b border-gray-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Quiz Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-dark">
              Quiz Performance
            </h2>

            <p className="mt-2 text-sm text-muted">
              Analyze attempts, pass rates, and average scores for quizzes in
              this course.
            </p>
          </div>

          {/* No quizzes */}

          {quizAnalytics.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl">
                📝
              </div>

              <p className="mt-4 text-sm font-semibold text-dark">
                No quizzes available
              </p>

              <p className="mt-1 text-sm text-muted">
                Create a quiz in one of your course sections to see performance
                analytics here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Quiz
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Attempts
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Passed
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Failed
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Pass Rate
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Average Score
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {quizAnalytics.map((quiz) => {
                    const passRate = Math.min(
                      Math.max(Number(quiz.passRate) || 0, 0),
                      100,
                    );

                    const averagePercentage = Math.min(
                      Math.max(Number(quiz.averagePercentage) || 0, 0),
                      100,
                    );

                    const status = getQuizStatus(quiz);

                    return (
                      <tr
                        key={quiz.quizId}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        {/* Quiz */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
                              📝
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate text-sm font-semibold text-dark">
                                {quiz.quizTitle}
                              </p>

                              <p className="mt-1 text-xs text-muted">
                                Section quiz
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Attempts */}

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-dark">
                            {quiz.totalAttempts}
                          </p>

                          <p className="mt-1 text-xs text-muted">submitted</p>
                        </td>

                        {/* Passed */}

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-green-600">
                            {quiz.passedAttempts}
                          </p>
                        </td>

                        {/* Failed */}

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-red-600">
                            {quiz.failedAttempts}
                          </p>
                        </td>

                        {/* Pass Rate */}

                        <td className="px-6 py-5">
                          <div className="w-40">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-semibold text-dark">
                                {passRate.toFixed(1)}%
                              </span>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{
                                  width: `${passRate}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Average Score */}

                        <td className="px-6 py-5">
                          <div className="w-40">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-semibold text-dark">
                                {averagePercentage.toFixed(1)}%
                              </span>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                                style={{
                                  width: `${averagePercentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =====================================================
            COURSE INFORMATION
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Course Information
          </p>

          <h2 className="mt-1 text-xl font-bold text-dark">
            Analytics Summary
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Course ID
              </p>

              <p className="mt-2 break-all text-sm font-medium text-dark">
                {analytics.courseId}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Enrollment Status
              </p>

              <p className="mt-2 text-sm font-semibold text-green-600">
                {analytics.totalStudents > 0
                  ? `${analytics.totalStudents} students enrolled`
                  : "No students enrolled"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default InstructorCourseAnalytics;
