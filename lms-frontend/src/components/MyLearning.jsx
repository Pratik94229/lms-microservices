import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuizHistory, setLoadingQuizHistory] = useState(true);
  const [error, setError] = useState("");
  const [quizHistoryError, setQuizHistoryError] = useState("");
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  /*
   * ============================================================
   * LOAD MY LEARNING
   * ============================================================
   *
   * Loads:
   * 1. Enrollments
   * 2. Course information
   * 3. Course progress
   * 4. Sections
   * 5. Lessons
   * 6. First incomplete lesson
   */
  useEffect(() => {
    const fetchMyLearning = async () => {
      try {
        setLoading(true);
        setError("");

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          setIsLoggedOut(true);
          setError("Please login to view your learning.");
          return;
        }

        const enrollmentResponse = await api.get("/enrollments/my");

        const activeEnrollments = (enrollmentResponse.data || []).filter(
          (enrollment) => enrollment.active,
        );

        const learningData = await Promise.all(
          activeEnrollments.map(async (enrollment) => {
            const [courseResponse, progressResponse, sectionsResponse] =
              await Promise.all([
                api.get(`/courses/${enrollment.courseId}`),
                api.get(`/progress/courses/${enrollment.courseId}`),
                api.get(`/courses/${enrollment.courseId}/sections`),
              ]);

            const sections = sectionsResponse.data || [];

            const sectionsWithLessons = await Promise.all(
              sections.map(async (section) => {
                const lessonsResponse = await api.get(
                  `/sections/${section.id}/lessons`,
                );

                return {
                  ...section,
                  lessons: lessonsResponse.data || [],
                };
              }),
            );

            const lessonProgressResponse = await api.get(
              `/progress/courses/${enrollment.courseId}/lessons`,
            );

            const completedLessonIds = new Set(
              (lessonProgressResponse.data || [])
                .filter((item) => item.completed)
                .map((item) => item.lessonId),
            );

            const sortedSections = [...sectionsWithLessons].sort(
              (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
            );

            let firstIncompleteLesson = null;
            let firstLesson = null;

            for (const section of sortedSections) {
              const sortedLessons = [...section.lessons].sort(
                (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
              );

              for (const lesson of sortedLessons) {
                if (!firstLesson) {
                  firstLesson = lesson;
                }

                if (
                  !firstIncompleteLesson &&
                  !completedLessonIds.has(lesson.id)
                ) {
                  firstIncompleteLesson = lesson;
                }
              }
            }

            return {
              enrollment,
              course: courseResponse.data,
              percentage: Number(progressResponse.data),
              completed: Boolean(enrollment.completed),
              completedAt: enrollment.completedAt,
              firstLesson,
              firstIncompleteLesson,
            };
          }),
        );

        setEnrollments(learningData);
      } catch (err) {
        console.error("Failed to load my learning:", err);

        if (err.response?.status === 401) {
          setIsLoggedOut(true);
          setError("Your login session is invalid or expired.");
        } else if (err.response?.status === 403) {
          setError("You are not enrolled in one of these courses.");
        } else {
          setError("Unable to load your learning. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyLearning();
  }, []);

  /*
   * ============================================================
   * LOAD QUIZ HISTORY
   * ============================================================
   *
   * GET:
   * /api/quizzes/attempts/my
   */
  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        setLoadingQuizHistory(true);
        setQuizHistoryError("");

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          return;
        }

        const attemptsResponse = await api.get("/quizzes/attempts/my");

        const attempts = attemptsResponse.data || [];

        /*
         * Load quiz information for each attempt.
         */
        const attemptsWithQuizInfo = await Promise.all(
          attempts.map(async (attempt) => {
            try {
              const quizResponse = await api.get(`/quizzes/${attempt.quizId}`);

              return {
                ...attempt,
                quiz: quizResponse.data,
              };
            } catch (err) {
              console.error(`Failed to load quiz ${attempt.quizId}:`, err);

              return {
                ...attempt,
                quiz: null,
              };
            }
          }),
        );

        /*
         * Newest attempts first.
         */
        const sortedAttempts = [...attemptsWithQuizInfo].sort((a, b) => {
          const dateA = new Date(a.submittedAt || a.startedAt || 0).getTime();

          const dateB = new Date(b.submittedAt || b.startedAt || 0).getTime();

          return dateB - dateA;
        });

        setQuizAttempts(sortedAttempts);
      } catch (err) {
        console.error("Failed to load quiz history:", err);

        if (err.response?.status === 401) {
          setQuizHistoryError("Your login session is invalid or expired.");
        } else if (err.response?.status === 403) {
          setQuizHistoryError(
            "You do not have permission to view quiz history.",
          );
        } else {
          setQuizHistoryError("Unable to load quiz history right now.");
        }
      } finally {
        setLoadingQuizHistory(false);
      }
    };

    fetchQuizHistory();
  }, []);

  /*
   * ============================================================
   * FORMAT QUIZ STATUS
   * ============================================================
   */
  const getAttemptStatus = (attempt) => {
    if (attempt.status === "IN_PROGRESS") {
      return {
        label: "In Progress",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    if (attempt.passed === true) {
      return {
        label: "Passed",
        className: "bg-green-100 text-green-700",
      };
    }

    if (attempt.passed === false) {
      return {
        label: "Failed",
        className: "bg-red-100 text-red-700",
      };
    }

    return {
      label: attempt.status || "Unknown",
      className: "bg-gray-100 text-gray-600",
    };
  };

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-secondary px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-muted">Loading your courses...</p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * ERROR STATE
   * ============================================================
   */
  if (error) {
    return (
      <main className="min-h-screen bg-secondary px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-red-500">{error}</p>

            {isLoggedOut && (
              <Link
                to="/login"
                className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 font-medium text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {/* ======================================================
            PAGE HEADING
            ====================================================== */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-dark">My Learning</h1>

          <p className="mt-2 text-muted">
            Continue learning from where you left off.
          </p>
        </div>

        {/* ======================================================
            ENROLLED COURSES
            ====================================================== */}
        {enrollments.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-dark">No courses yet</h2>

            <p className="mt-2 text-muted">
              Explore our courses and start learning today.
            </p>

            <Link
              to="/courses"
              className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map(
              ({
                enrollment,
                course,
                percentage,
                completed,
                completedAt,
                firstLesson,
                firstIncompleteLesson,
              }) => {
                const safePercentage = Number.isFinite(percentage)
                  ? Math.min(Math.max(percentage, 0), 100)
                  : 0;

                const isCompleted = completed || safePercentage >= 100;

                let learningUrl = `/courses/${course.id}`;
                let buttonText = "Start Learning";

                if (isCompleted) {
                  learningUrl = `/courses/${course.id}`;
                  buttonText = "Review Course";
                } else if (safePercentage > 0) {
                  if (firstIncompleteLesson) {
                    learningUrl = `/courses/${course.id}/lessons/${firstIncompleteLesson.id}`;
                  } else if (firstLesson) {
                    learningUrl = `/courses/${course.id}/lessons/${firstLesson.id}`;
                  }

                  buttonText = "Continue Learning";
                } else {
                  if (firstLesson) {
                    learningUrl = `/courses/${course.id}/lessons/${firstLesson.id}`;
                  }

                  buttonText = "Start Learning";
                }

                return (
                  <div
                    key={enrollment.id}
                    className={`overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                      isCompleted ? "ring-1 ring-green-200" : ""
                    }`}
                  >
                    {/* Course header */}
                    <div
                      className={`h-36 ${
                        isCompleted
                          ? "bg-gradient-to-br from-green-100 to-green-50"
                          : "bg-gradient-to-br from-primary/20 to-primary/5"
                      }`}
                    >
                      <div className="flex h-full items-center justify-center">
                        <span
                          className={`text-4xl font-bold ${
                            isCompleted ? "text-green-600" : "text-primary"
                          }`}
                        >
                          {course.title?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Course information */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="line-clamp-2 text-lg font-semibold text-dark">
                          {course.title}
                        </h2>

                        {isCompleted && (
                          <span className="whitespace-nowrap rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            ✓ Completed
                          </span>
                        )}
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm text-muted">
                        {course.description}
                      </p>

                      {/* Progress */}
                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-muted">Progress</span>

                          <span
                            className={`font-semibold ${
                              isCompleted ? "text-green-600" : "text-dark"
                            }`}
                          >
                            {safePercentage.toFixed(2)}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? "bg-green-500" : "bg-primary"
                            }`}
                            style={{
                              width: `${safePercentage}%`,
                            }}
                          />
                        </div>

                        {isCompleted ? (
                          <div className="mt-3 rounded-lg bg-green-50 px-3 py-2">
                            <p className="text-sm font-medium text-green-700">
                              🎉 Course completed successfully.
                            </p>

                            {completedAt && (
                              <p className="mt-1 text-xs text-green-600">
                                Completed on{" "}
                                {new Date(completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-muted">
                            Keep learning to complete this course.
                          </p>
                        )}
                      </div>

                      {/* Start / Continue / Review */}
                      <Link
                        to={learningUrl}
                        className={`mt-5 block rounded-lg px-4 py-2.5 text-center font-medium text-white transition hover:opacity-90 ${
                          isCompleted ? "bg-green-600" : "bg-primary"
                        }`}
                      >
                        {buttonText}
                      </Link>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}

        {/* ======================================================
            QUIZ HISTORY
            ====================================================== */}
        <section className="mt-14">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Assessments
            </p>

            <h2 className="mt-1 text-2xl font-bold text-dark">Quiz History</h2>

            <p className="mt-2 text-sm text-muted">
              View your previous quiz attempts and results.
            </p>
          </div>

          {loadingQuizHistory ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-muted">Loading quiz history...</p>
            </div>
          ) : quizHistoryError ? (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
              <p className="text-sm font-medium text-yellow-700">
                {quizHistoryError}
              </p>
            </div>
          ) : quizAttempts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
                📝
              </div>

              <h3 className="mt-4 text-lg font-semibold text-dark">
                No quiz attempts yet
              </h3>

              <p className="mt-2 text-sm text-muted">
                Complete a quiz in one of your enrolled courses and your result
                will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizAttempts.map((attempt) => {
                const status = getAttemptStatus(attempt);

                const percentage = Number.isFinite(Number(attempt.percentage))
                  ? Math.min(Math.max(Number(attempt.percentage), 0), 100)
                  : 0;

                const quizTitle = attempt.quiz?.title || "Quiz";

                const quizDescription = attempt.quiz?.description || "";

                const dateValue = attempt.submittedAt || attempt.startedAt;

                const isSubmitted = attempt.status !== "IN_PROGRESS";

                return (
                  <div
                    key={attempt.id}
                    className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* Quiz information */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-dark">
                            {quizTitle}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        {quizDescription && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted">
                            {quizDescription}
                          </p>
                        )}

                        {dateValue && (
                          <p className="mt-2 text-xs text-muted">
                            {attempt.submittedAt
                              ? `Submitted on ${new Date(
                                  attempt.submittedAt,
                                ).toLocaleString()}`
                              : `Started on ${new Date(
                                  dateValue,
                                ).toLocaleString()}`}
                          </p>
                        )}
                      </div>

                      {/* Result information */}
                      <div className="grid grid-cols-3 gap-3 lg:min-w-[430px]">
                        <div className="rounded-lg bg-gray-50 px-4 py-3 text-center">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted">
                            Score
                          </p>

                          <p className="mt-1 text-lg font-bold text-dark">
                            {attempt.score ?? 0}
                            {attempt.totalMarks != null
                              ? ` / ${attempt.totalMarks}`
                              : ""}
                          </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 px-4 py-3 text-center">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted">
                            Percentage
                          </p>

                          <p
                            className={`mt-1 text-lg font-bold ${
                              attempt.passed === true
                                ? "text-green-600"
                                : attempt.passed === false
                                  ? "text-red-600"
                                  : "text-dark"
                            }`}
                          >
                            {percentage.toFixed(2)}%
                          </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 px-4 py-3 text-center">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted">
                            Passing
                          </p>

                          <p className="mt-1 text-lg font-bold text-dark">
                            {attempt.quiz?.passingScore != null
                              ? `${attempt.quiz.passingScore}%`
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Percentage progress */}
                    <div className="mt-5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            attempt.passed === true
                              ? "bg-green-500"
                              : attempt.passed === false
                                ? "bg-red-500"
                                : "bg-primary"
                          }`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* View Result */}
                    {isSubmitted && (
                      <div className="mt-5 flex justify-end">
                        <Link
                          to={`/quiz-results/${attempt.id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          View Result
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default MyLearning;
