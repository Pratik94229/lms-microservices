import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

// Student lesson learning page.
function Lesson() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  /*
   * Scroll to the top whenever the student opens
   * a different lesson.
   */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [lessonId]);

  /*
   * Load the complete course learning structure.
   *
   * We fetch:
   * 1. Course
   * 2. Sections
   * 3. Lessons for every section
   * 4. Quizzes for every section
   * 5. Student progress
   */
  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        setLoading(true);
        setError("");
        setLesson(null);

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          setError("Please login before viewing this lesson.");
          return;
        }

        /*
         * Get course, sections, and completed lesson records.
         */
        const [courseResponse, sectionsResponse, progressResponse] =
          await Promise.all([
            api.get(`/courses/${courseId}`),
            api.get(`/courses/${courseId}/sections`),
            api.get(`/progress/courses/${courseId}/lessons`),
          ]);

        setCourse(courseResponse.data);
        setCompletedLessons(progressResponse.data || []);

        /*
         * Load lessons and quizzes for every section.
         */
        const sectionsWithLessons = await Promise.all(
          sectionsResponse.data.map(async (section) => {
            const [lessonsResponse, quizzesResponse] = await Promise.all([
              api.get(`/sections/${section.id}/lessons`),
              api.get(`/quizzes/sections/${section.id}`),
            ]);

            return {
              ...section,
              lessons: lessonsResponse.data || [],
              quizzes: quizzesResponse.data || [],
            };
          }),
        );

        /*
         * Sort sections according to their order.
         */
        const sortedSections = [...sectionsWithLessons].sort(
          (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
        );

        /*
         * Sort lessons and quizzes inside every section.
         */
        const sortedSectionsWithLessons = sortedSections.map((section) => ({
          ...section,

          lessons: [...section.lessons].sort(
            (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
          ),

          quizzes: [...(section.quizzes || [])].sort(
            (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
          ),
        }));

        setSections(sortedSectionsWithLessons);

        /*
         * Find the lesson requested in the URL.
         */
        let currentLesson = null;

        for (const section of sortedSectionsWithLessons) {
          const foundLesson = section.lessons.find(
            (item) => item.id === lessonId,
          );

          if (foundLesson) {
            currentLesson = {
              ...foundLesson,
              sectionId: section.id,
              sectionTitle: section.title,
            };

            break;
          }
        }

        if (!currentLesson) {
          setError("Lesson not found.");
          return;
        }

        setLesson(currentLesson);
      } catch (err) {
        console.error("Failed to load lesson:", err);

        if (err.response?.status === 401) {
          setError("Your login session is invalid or expired.");
        } else if (err.response?.status === 403) {
          setError("You are not enrolled in this course.");
        } else if (err.response?.status === 404) {
          setError("Lesson not found.");
        } else {
          setError("Unable to load lesson. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, [courseId, lessonId]);

  /*
   * Create one flat list of all lessons.
   *
   * This allows us to easily determine:
   * - current lesson
   * - previous lesson
   * - next lesson
   */
  const allLessons = useMemo(() => {
    return sections.flatMap((section) =>
      section.lessons.map((lessonItem) => ({
        ...lessonItem,
        sectionId: section.id,
        sectionTitle: section.title,
      })),
    );
  }, [sections]);

  /*
   * Current lesson position.
   */
  const currentLessonIndex = allLessons.findIndex(
    (item) => item.id === lessonId,
  );

  /*
   * Previous lesson.
   */
  const previousLesson =
    currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;

  /*
   * Next lesson.
   */
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null;

  /*
   * Count completed lessons.
   */
  const completedLessonCount = completedLessons.filter(
    (item) => item.completed,
  ).length;

  /*
   * Calculate course progress locally.
   *
   * Example:
   * 4 completed / 9 total = 44.44%
   */
  const coursePercentage =
    allLessons.length > 0
      ? Math.min(
          Math.max((completedLessonCount / allLessons.length) * 100, 0),
          100,
        )
      : 0;

  /*
   * Check whether a particular lesson is completed.
   */
  const isLessonCompleted = (id) => {
    return completedLessons.some(
      (item) => item.lessonId === id && item.completed,
    );
  };

  /*
   * Open a quiz.
   *
   * The actual quiz-taking page will be created in the
   * next step. For now, this function is intentionally
   * prepared for that route.
   */
  const openQuiz = (quizId) => {
    navigate(`/quizzes/${quizId}`);
  };

  /*
   * Mark current lesson as completed.
   */
  const handleComplete = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setError("Please login before completing this lesson.");
        return;
      }

      setCompleting(true);
      setError("");

      await api.post(`/progress/lessons/${lessonId}/complete`, {});

      /*
       * Update local state immediately.
       *
       * This gives the student instant feedback without
       * refreshing the page.
       */
      setCompletedLessons((previous) => {
        const existing = previous.find((item) => item.lessonId === lessonId);

        if (existing) {
          return previous.map((item) =>
            item.lessonId === lessonId
              ? {
                  ...item,
                  completed: true,
                }
              : item,
          );
        }

        return [
          ...previous,
          {
            lessonId,
            completed: true,
          },
        ];
      });
    } catch (err) {
      console.error("Failed to complete lesson:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You are not enrolled in this course.");
      } else {
        setError("Unable to mark lesson as complete.");
      }
    } finally {
      setCompleting(false);
    }
  };

  /*
   * Convert common YouTube URLs to embed URLs.
   */
  const getVideoUrl = (url) => {
    if (!url) {
      return "";
    }

    if (url.includes("/embed/")) {
      return url;
    }

    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }

    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return url;
  };

  /*
   * Navigate to another lesson.
   */
  const openLesson = (targetLessonId) => {
    navigate(`/courses/${courseId}/lessons/${targetLessonId}`);
  };

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-secondary">
        <p className="text-muted">Loading lesson...</p>
      </main>
    );
  }

  /*
   * Error state.
   */
  if (error) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-600">{error}</p>

          <Link
            to={`/courses/${courseId}`}
            className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to Course
          </Link>
        </div>
      </main>
    );
  }

  /*
   * Lesson not found.
   */
  if (!lesson) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <p className="text-muted">Lesson not found.</p>
      </main>
    );
  }

  const currentCompleted = isLessonCompleted(lesson.id);

  const isCourseCompleted =
    allLessons.length > 0 && completedLessonCount >= allLessons.length;

  return (
    <main className="min-h-[calc(100vh-80px)] bg-secondary">
      {/* Top course bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to={`/courses/${courseId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to Course
          </Link>

          <div className="hidden text-right md:block">
            <p className="text-xs text-muted">Currently learning</p>

            <p className="max-w-md truncate text-sm font-semibold text-dark">
              {course?.title}
            </p>
          </div>
        </div>
      </div>

      {/* Main learning layout */}
      <div className="mx-auto flex max-w-7xl">
        {/* Course sidebar */}
        <aside className="hidden w-80 shrink-0 border-r border-gray-200 bg-white lg:block">
          <div className="sticky top-0 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* Sidebar header */}
            <div className="border-b border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Course Content
              </p>

              <h2 className="mt-2 line-clamp-2 text-lg font-bold text-dark">
                {course?.title}
              </h2>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted">Course Progress</span>

                  <span className="font-semibold text-primary">
                    {coursePercentage.toFixed(0)}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${coursePercentage}%`,
                    }}
                  />
                </div>
              </div>

              <p className="mt-3 text-xs text-muted">
                {completedLessonCount} of {allLessons.length} lessons completed
              </p>
            </div>

            {/* Sections */}
            <div>
              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="border-b border-gray-200">
                  {/* Section heading */}
                  <div className="bg-gray-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Section {sectionIndex + 1}
                    </p>

                    <h3 className="mt-1 font-semibold text-dark">
                      {section.title}
                    </h3>
                  </div>

                  {/* Lessons */}
                  <div>
                    {section.lessons.map((lessonItem, lessonIndex) => {
                      const isCurrent = lessonItem.id === lessonId;
                      const isCompleted = isLessonCompleted(lessonItem.id);

                      return (
                        <button
                          key={lessonItem.id}
                          type="button"
                          onClick={() => openLesson(lessonItem.id)}
                          className={`flex w-full items-start gap-3 px-5 py-3 text-left transition ${
                            isCurrent ? "bg-primary/10" : "hover:bg-gray-50"
                          }`}
                        >
                          {/* Lesson status */}
                          <span
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                              isCompleted
                                ? "border-green-500 bg-green-500 text-white"
                                : isCurrent
                                  ? "border-primary text-primary"
                                  : "border-gray-300 text-gray-400"
                            }`}
                          >
                            {isCompleted ? "✓" : lessonIndex + 1}
                          </span>

                          {/* Lesson title */}
                          <span
                            className={`text-sm leading-5 ${
                              isCurrent
                                ? "font-semibold text-primary"
                                : "text-dark"
                            }`}
                          >
                            {lessonItem.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quizzes */}
                  {section.quizzes && section.quizzes.length > 0 && (
                    <div className="border-t border-gray-100 bg-white">
                      {section.quizzes.map((quiz) => (
                        <button
                          key={quiz.id}
                          type="button"
                          onClick={() => openQuiz(quiz.id)}
                          className="flex w-full items-start gap-3 px-5 py-3 text-left transition hover:bg-primary/5"
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/10 text-xs font-bold text-primary">
                            ?
                          </span>

                          <span className="min-w-0">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-primary">
                              Quiz
                            </span>

                            <span className="mt-0.5 block text-sm font-semibold text-dark">
                              {quiz.title}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Lesson content */}
        <section className="min-w-0 flex-1">
          <div className="mx-auto max-w-4xl px-6 py-8">
            {/* Lesson position */}
            <div className="mb-4 flex items-center justify-between">
              {currentLessonIndex >= 0 && (
                <p className="text-sm font-medium text-muted">
                  Lesson {currentLessonIndex + 1} of {allLessons.length}
                </p>
              )}

              {currentCompleted && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  ✓ Completed
                </span>
              )}
            </div>

            {/* Video */}
            <div className="overflow-hidden rounded-2xl bg-black shadow-sm">
              {lesson.videoUrl ? (
                <div className="aspect-video">
                  <iframe
                    className="h-full w-full"
                    src={getVideoUrl(lesson.videoUrl)}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-gray-900">
                  <p className="text-white">
                    No video available for this lesson.
                  </p>
                </div>
              )}
            </div>

            {/* Lesson information */}
            <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                {lesson.sectionTitle || "Lesson"}
              </p>

              <h1 className="mt-2 text-3xl font-bold text-dark">
                {lesson.title}
              </h1>

              {lesson.description && (
                <p className="mt-4 leading-7 text-muted">
                  {lesson.description}
                </p>
              )}

              {/* Lesson content */}
              {lesson.content && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h2 className="text-xl font-semibold text-dark">
                    Lesson Content
                  </h2>

                  <p className="mt-4 whitespace-pre-line leading-7 text-muted">
                    {lesson.content}
                  </p>
                </div>
              )}

              {/* Completion */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={currentCompleted || completing}
                    className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {completing
                      ? "Saving..."
                      : currentCompleted
                        ? "✓ Completed"
                        : "Mark as Complete"}
                  </button>

                  {currentCompleted && (
                    <span className="text-sm font-medium text-green-600">
                      Lesson completed successfully.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Previous / Next navigation */}
            <div className="mt-6 flex items-stretch justify-between gap-4">
              {/* Previous */}
              {previousLesson ? (
                <button
                  type="button"
                  onClick={() => openLesson(previousLesson.id)}
                  className="flex max-w-[48%] flex-1 flex-col rounded-xl border border-gray-200 bg-white px-5 py-4 text-left transition hover:border-primary hover:shadow-sm"
                >
                  <span className="text-xs font-medium text-muted">
                    Previous Lesson
                  </span>

                  <span className="mt-1 truncate font-semibold text-dark">
                    ← {previousLesson.title}
                  </span>
                </button>
              ) : (
                <div className="flex-1" />
              )}

              {/* Next */}
              {nextLesson ? (
                <button
                  type="button"
                  onClick={() => openLesson(nextLesson.id)}
                  className={`flex max-w-[48%] flex-1 flex-col rounded-xl px-5 py-4 text-right font-semibold transition hover:opacity-90 ${
                    currentCompleted
                      ? "bg-primary text-white shadow-sm"
                      : "border border-gray-200 bg-white text-dark hover:border-primary"
                  }`}
                >
                  <span
                    className={`text-xs font-medium ${
                      currentCompleted ? "text-white/80" : "text-muted"
                    }`}
                  >
                    Next Lesson
                  </span>

                  <span className="mt-1 truncate">{nextLesson.title} →</span>
                </button>
              ) : (
                <Link
                  to={`/courses/${courseId}`}
                  className="flex max-w-[48%] flex-1 flex-col rounded-xl bg-primary px-5 py-4 text-right font-semibold text-white transition hover:opacity-90"
                >
                  <span className="text-xs font-medium text-white/80">
                    {isCourseCompleted ? "Course Completed" : "Final Lesson"}
                  </span>

                  <span className="mt-1">
                    {isCourseCompleted ? "View Course →" : "Finish Course →"}
                  </span>
                </Link>
              )}
            </div>

            {/* Mobile lesson navigation */}
            <div className="mt-6 lg:hidden">
              <details className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <summary className="cursor-pointer px-5 py-4 font-semibold text-dark">
                  Course Content
                </summary>

                <div className="border-t border-gray-200">
                  {sections.map((section, sectionIndex) => (
                    <div
                      key={section.id}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      <div className="bg-gray-50 px-5 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Section {sectionIndex + 1}
                        </p>

                        <p className="mt-1 font-semibold text-dark">
                          {section.title}
                        </p>
                      </div>

                      {/* Mobile lessons */}
                      {section.lessons.map((lessonItem, lessonIndex) => {
                        const isCurrent = lessonItem.id === lessonId;

                        const isCompleted = isLessonCompleted(lessonItem.id);

                        return (
                          <button
                            key={lessonItem.id}
                            type="button"
                            onClick={() => openLesson(lessonItem.id)}
                            className={`flex w-full items-center gap-3 px-5 py-3 text-left ${
                              isCurrent ? "bg-primary/10" : ""
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                                isCompleted
                                  ? "border-green-500 bg-green-500 text-white"
                                  : isCurrent
                                    ? "border-primary text-primary"
                                    : "border-gray-300 text-gray-400"
                              }`}
                            >
                              {isCompleted ? "✓" : lessonIndex + 1}
                            </span>

                            <span
                              className={`text-sm ${
                                isCurrent
                                  ? "font-semibold text-primary"
                                  : "text-dark"
                              }`}
                            >
                              {lessonItem.title}
                            </span>
                          </button>
                        );
                      })}

                      {/* Mobile quizzes */}
                      {section.quizzes && section.quizzes.length > 0 && (
                        <div className="border-t border-gray-100 bg-white">
                          {section.quizzes.map((quiz) => (
                            <button
                              key={quiz.id}
                              type="button"
                              onClick={() => openQuiz(quiz.id)}
                              className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-primary/5"
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/10 text-xs font-bold text-primary">
                                ?
                              </span>

                              <span className="min-w-0">
                                <span className="block text-xs font-semibold uppercase tracking-wide text-primary">
                                  Quiz
                                </span>

                                <span className="block text-sm font-semibold text-dark">
                                  {quiz.title}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Lesson;
