import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { getAccessToken } from "../utils/auth";

// Displays course details, payment/enrollment state,
// progress, sections, and lessons.
function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Course information
  const [course, setCourse] = useState(null);

  // Course sections
  const [sections, setSections] = useState([]);

  // Lessons grouped by section ID
  const [lessons, setLessons] = useState({});

  // Course progress percentage
  const [progress, setProgress] = useState(0);

  // Enrollment state
  const [enrolled, setEnrolled] = useState(false);

  // Payment request state
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Payment/enrollment error
  const [enrollmentError, setEnrollmentError] = useState("");

  // Currently open section
  const [openSection, setOpenSection] = useState(null);

  // Page loading state
  const [loading, setLoading] = useState(true);

  // Page error
  const [error, setError] = useState("");

  // A course is completed when progress reaches 100%.
  const isCompleted = progress >= 100;

  // =========================================================
  // LOAD COURSE DATA
  // =========================================================

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Check whether the student is logged in.
        // The course itself remains public.
        const accessToken = getAccessToken();

        // Fetch course.
        const courseResponse = await api.get(`/courses/${courseId}`);

        setCourse(courseResponse.data);

        // Fetch sections.
        // Sections are public course content.
        const sectionsResponse = await api.get(`/courses/${courseId}/sections`);

        setSections(sectionsResponse.data);

        // Enrollment and progress are only relevant
        // when the user is logged in.
        if (accessToken) {
          try {
            await api.get(`/enrollments/courses/${courseId}/access`);

            // Student is enrolled.
            setEnrolled(true);

            // Fetch progress.
            const progressResponse = await api.get(
              `/progress/courses/${courseId}`,
            );

            setProgress(Number(progressResponse.data) || 0);
          } catch (enrollmentCheckError) {
            // User is authenticated but not enrolled.
            if (enrollmentCheckError.response?.status === 403) {
              setEnrolled(false);
              setProgress(0);
            } else if (enrollmentCheckError.response?.status === 401) {
              // Token is invalid or expired.
              setEnrolled(false);
              setProgress(0);
            } else {
              throw enrollmentCheckError;
            }
          }
        } else {
          // Anonymous visitor.
          // Course browsing is allowed.
          setEnrolled(false);
          setProgress(0);
        }
      } catch (err) {
        console.error("Failed to load course:", err);

        if (err.response?.status === 404) {
          setError("Course not found.");
        } else if (err.response?.status === 401) {
          setError("Your login session is invalid or expired.");
        } else {
          setError("Unable to load course. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // =========================================================
  // PAYPAL PAYMENT
  // =========================================================

  const handlePayment = async () => {
    const accessToken = getAccessToken();

    // Payment requires authentication.
    if (!accessToken) {
      navigate("/login", {
        replace: false,
        state: {
          from: `/courses/${courseId}`,
        },
      });

      return;
    }

    try {
      setEnrollmentError("");
      setPaymentLoading(true);

      // Ask backend to create a PayPal order.
      //
      // The backend gets the actual course price
      // from the database.
      const response = await api.post("/payments/create", {
        courseId,
      });

      const approvalUrl = response.data?.approvalUrl;

      // PayPal must return an approval URL.
      if (!approvalUrl) {
        throw new Error("PayPal approval URL was not returned.");
      }

      // Redirect the student to PayPal.
      window.location.href = approvalUrl;
    } catch (err) {
      console.error("Failed to create PayPal order:", err);

      if (err.response?.status === 401) {
        setEnrollmentError("Please login again.");
      } else if (err.response?.status === 403) {
        setEnrollmentError("This course is not available for purchase.");
      } else {
        setEnrollmentError(
          err.response?.data?.message ||
            "Unable to start payment. Please try again.",
        );
      }

      setPaymentLoading(false);
    }
  };

  // =========================================================
  // LOAD LESSONS WHEN A SECTION OPENS
  // =========================================================

  const handleSectionClick = async (sectionId) => {
    // Close section if already open.
    if (openSection === sectionId) {
      setOpenSection(null);
      return;
    }

    // Open section.
    setOpenSection(sectionId);

    // Use cached lessons.
    if (lessons[sectionId]) {
      return;
    }

    try {
      // Public lesson listing.
      const response = await api.get(`/sections/${sectionId}/lessons`);

      setLessons((previousLessons) => ({
        ...previousLessons,
        [sectionId]: response.data,
      }));
    } catch (err) {
      console.error("Failed to load lessons:", err);
    }
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <p className="text-muted">Loading course...</p>
      </main>
    );
  }

  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="bg-white">
      {/* =====================================================
          COURSE HEADER
      ====================================================== */}

      <section className="bg-secondary px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Course
          </p>

          <h1 className="mt-2 text-4xl font-bold text-dark">{course.title}</h1>

          <p className="mt-4 max-w-3xl leading-7 text-muted">
            {course.description}
          </p>

          <div className="mt-6 flex items-center gap-6">
            {/* PayPal currently charges USD */}
            <span className="text-2xl font-bold text-primary">
              ${Number(course.price / 95).toFixed(2)} USD
            </span>

            {enrolled ? (
              isCompleted ? (
                <span className="rounded-lg bg-green-100 px-6 py-3 font-semibold text-green-700">
                  ✓ Course Completed
                </span>
              ) : (
                <span className="rounded-lg bg-green-100 px-6 py-3 font-semibold text-green-700">
                  ✓ Enrolled
                </span>
              )
            ) : (
              <button
                type="button"
                onClick={handlePayment}
                disabled={paymentLoading}
                className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentLoading ? "Processing..." : "Buy Course"}
              </button>
            )}
          </div>

          {enrollmentError && (
            <p className="mt-4 text-sm font-medium text-red-600">
              {enrollmentError}
            </p>
          )}
        </div>
      </section>

      {/* =====================================================
          COURSE PROGRESS
      ====================================================== */}

      {enrolled && (
        <section className="px-6 pt-12">
          <div
            className={`mx-auto max-w-5xl rounded-xl border p-6 shadow-sm ${
              isCompleted
                ? "border-green-200 bg-green-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Your Progress
                </p>

                <h2 className="mt-1 text-xl font-bold text-dark">
                  {isCompleted ? "Course Completed" : "Course Completion"}
                </h2>
              </div>

              <span
                className={`text-2xl font-bold ${
                  isCompleted ? "text-green-600" : "text-primary"
                }`}
              >
                {Math.min(progress, 100).toFixed(2)}%
              </span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted ? "bg-green-500" : "bg-primary"
                }`}
                style={{
                  width: `${Math.min(progress, 100)}%`,
                }}
              />
            </div>

            {isCompleted ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-green-700">
                  🎉 Congratulations! You have completed all lessons in this
                  course.
                </p>

                <Link
                  to="/my-learning"
                  className="inline-flex w-fit rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Back to My Learning
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Keep learning to complete this course.
              </p>
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          COURSE CURRICULUM
      ====================================================== */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Curriculum
            </p>

            <h2 className="mt-2 text-3xl font-bold text-dark">
              Course Content
            </h2>

            <p className="mt-2 text-muted">
              {sections.length} sections · Click a section to view its lessons
            </p>
          </div>

          <div className="space-y-4">
            {sections.map((section) => {
              const isOpen = openSection === section.id;

              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-xl border border-gray-200"
                >
                  {/* Section header */}
                  <button
                    type="button"
                    onClick={() => handleSectionClick(section.id)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-secondary"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary">
                        Section {section.orderIndex}
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-dark">
                        {section.title}
                      </h3>

                      <p className="mt-1 text-sm text-muted">
                        {section.description}
                      </p>
                    </div>

                    <span className="ml-4 text-xl text-muted">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {/* Lessons */}
                  {isOpen && (
                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                      {!lessons[section.id] && (
                        <p className="py-3 text-sm text-muted">
                          Loading lessons...
                        </p>
                      )}

                      {lessons[section.id]?.length === 0 && (
                        <p className="py-3 text-sm text-muted">
                          No lessons available.
                        </p>
                      )}

                      <div className="space-y-2">
                        {lessons[section.id]?.map((lesson) => (
                          <Link
                            key={lesson.id}
                            to={`/courses/${courseId}/lessons/${lesson.id}`}
                            className="flex items-center justify-between rounded-lg bg-white px-4 py-4 transition hover:bg-secondary"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-primary">▶</span>

                              <div>
                                <p className="font-medium text-dark">
                                  {lesson.orderIndex}. {lesson.title}
                                </p>

                                <p className="mt-1 text-sm text-muted">
                                  {lesson.description}
                                </p>
                              </div>
                            </div>

                            <span className="ml-4 whitespace-nowrap text-sm text-muted">
                              {lesson.duration} min
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export default CourseDetails;
