import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { isInstructor } from "../../utils/auth";

// Instructor dashboard for managing courses.
function InstructorDashboard() {
  const navigate = useNavigate();

  // Store instructor's courses.
  const [courses, setCourses] = useState([]);

  // Page loading state.
  const [loading, setLoading] = useState(true);

  // Page error.
  const [error, setError] = useState("");

  // Show/hide create course form.
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create course loading state.
  const [creating, setCreating] = useState(false);

  // Create course error.
  const [createError, setCreateError] = useState("");

  // New course form data.
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    // Make sure only instructors use this page.
    if (!isInstructor()) {
      navigate("/", {
        replace: true,
      });
      return;
    }

    // Load instructor's courses.
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses/my");

        setCourses(response.data);
      } catch (err) {
        console.error("Failed to load instructor courses:", err);

        if (err.response?.status === 401) {
          setError("Your login session is invalid or expired.");
        } else if (err.response?.status === 403) {
          setError("You do not have instructor access.");
        } else {
          setError("Unable to load your courses. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  // Update create course form.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // Create a new course.
  const handleCreateCourse = async (event) => {
    event.preventDefault();

    setCreateError("");
    setCreating(true);

    try {
      const response = await api.post("/courses", {
        title: form.title,
        description: form.description,
        price: Number(form.price),
      });

      // Add the newly created course to the list.
      setCourses((previousCourses) => [response.data, ...previousCourses]);

      // Clear the form.
      setForm({
        title: "",
        description: "",
        price: "",
      });

      // Hide the form.
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create course:", err);

      if (err.response?.status === 400) {
        setCreateError("Please check the course details and try again.");
      } else if (err.response?.status === 401) {
        setCreateError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setCreateError("You do not have instructor access.");
      } else {
        setCreateError("Unable to create course. Please try again.");
      }
    } finally {
      setCreating(false);
    }
  };

  // Loading state.
  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-muted">Loading instructor dashboard...</p>
        </div>
      </main>
    );
  }

  // Page error.
  if (error) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Dashboard header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Instructor
            </p>

            <h1 className="mt-2 text-3xl font-bold text-dark">
              Instructor Dashboard
            </h1>

            <p className="mt-2 text-muted">Create and manage your courses.</p>
          </div>

          {/* Create course button */}
          <button
            type="button"
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setCreateError("");
            }}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {showCreateForm ? "Cancel" : "+ Create Course"}
          </button>
        </div>

        {/* Create course form */}
        {showCreateForm && (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                New Course
              </p>

              <h2 className="mt-1 text-xl font-bold text-dark">
                Create a Course
              </h2>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-5">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Course Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Java & Spring Boot Masterclass"
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what students will learn..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>

              {/* Price */}
              <div className="max-w-xs">
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Price
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    ₹
                  </span>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="999"
                    className="h-12 w-full rounded-lg border border-gray-200 pl-9 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    required
                  />
                </div>
              </div>

              {/* Create error */}
              {createError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                  {createError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Course"}
              </button>
            </form>
          </section>
        )}

        {/* Course statistics */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Total Courses</p>

            <p className="mt-2 text-3xl font-bold text-dark">
              {courses.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Published</p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {courses.filter((course) => course.published).length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Drafts</p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {courses.filter((course) => !course.published).length}
            </p>
          </div>
        </div>

        {/* Course list */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-dark">My Courses</h2>

            <p className="mt-1 text-sm text-muted">
              Manage the courses you have created.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <h3 className="text-lg font-semibold text-dark">
                No courses yet
              </h3>

              <p className="mt-2 text-sm text-muted">
                Create your first course to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Course visual */}
                  <div className="flex h-36 items-center justify-center bg-primary/10">
                    <span className="text-5xl font-bold text-primary">
                      {course.title?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>

                  {/* Course details */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-dark">{course.title}</h3>

                      {course.published ? (
                        <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Published
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          Draft
                        </span>
                      )}
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
                      {course.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ₹{course.price}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/instructor/courses/${course.id}`)
                        }
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-dark transition hover:border-primary hover:text-primary"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default InstructorDashboard;
