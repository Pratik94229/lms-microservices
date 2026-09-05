import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { isInstructor } from "../../utils/auth";
import LessonManager from "./LessonManager";
import QuizManager from "./QuizManager";

// Manages one instructor-owned course.
function InstructorCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // COURSE STATE
  // =========================================================

  const [course, setCourse] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
  });

  // =========================================================
  // SECTION STATE
  // =========================================================

  const [sections, setSections] = useState([]);

  const [openSections, setOpenSections] = useState({});

  const [showSectionForm, setShowSectionForm] = useState(false);

  const [editingSectionId, setEditingSectionId] = useState(null);

  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
    orderIndex: "",
  });

  const [sectionLoading, setSectionLoading] = useState(false);

  const [sectionError, setSectionError] = useState("");

  // =========================================================
  // PAGE STATE
  // =========================================================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [publishing, setPublishing] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD COURSE AND SECTIONS
  // =========================================================

  useEffect(() => {
    if (!isInstructor()) {
      navigate("/", {
        replace: true,
      });

      return;
    }

    const fetchCourse = async () => {
      try {
        setError("");
        setSuccess("");

        // Load course.
        const courseResponse = await api.get(`/courses/${courseId}`);

        const courseData = courseResponse.data;

        setCourse(courseData);

        // Populate course form.
        setForm({
          title: courseData.title || "",
          description: courseData.description || "",
          price: courseData.price ?? "",
        });

        // Load sections.
        const sectionsResponse = await api.get(`/courses/${courseId}/sections`);

        // Sort sections by order.
        const sortedSections = [...sectionsResponse.data].sort(
          (a, b) => a.orderIndex - b.orderIndex,
        );

        setSections(sortedSections);
      } catch (err) {
        console.error("Failed to load course:", err);

        if (err.response?.status === 401) {
          setError("Your login session is invalid or expired.");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to manage this course.");
        } else if (err.response?.status === 404) {
          setError("Course not found.");
        } else {
          setError("Unable to load course. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  // =========================================================
  // COURSE FORM
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // UPDATE COURSE
  // =========================================================

  const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(`/courses/${courseId}`, {
        title: form.title,
        description: form.description,
        price: Number(form.price),
      });

      setCourse(response.data);

      setForm({
        title: response.data.title || "",
        description: response.data.description || "",
        price: response.data.price ?? "",
      });

      setSuccess("Course details updated successfully.");
    } catch (err) {
      console.error("Failed to update course:", err);

      if (err.response?.status === 400) {
        setError("Please check the course details.");
      } else if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to update this course.");
      } else if (err.response?.status === 404) {
        setError("Course not found.");
      } else {
        setError("Unable to update course. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // PUBLISH COURSE
  // =========================================================

  const handlePublish = async () => {
    setPublishing(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(`/courses/${courseId}/publish`, {});

      setCourse(response.data);

      setSuccess("Course published successfully.");
    } catch (err) {
      console.error("Failed to publish course:", err);

      if (err.response?.status === 400) {
        setError("This course cannot be published yet. Check its content.");
      } else if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to publish this course.");
      } else if (err.response?.status === 404) {
        setError("Course not found.");
      } else {
        setError("Unable to publish course. Please try again.");
      }
    } finally {
      setPublishing(false);
    }
  };

  // =========================================================
  // DELETE COURSE
  // =========================================================

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await api.delete(`/courses/${courseId}`);

      navigate("/instructor", {
        replace: true,
      });
    } catch (err) {
      console.error("Failed to delete course:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to delete this course.");
      } else if (err.response?.status === 404) {
        setError("Course not found.");
      } else {
        setError("Unable to delete course. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // SECTION FORM
  // =========================================================

  const handleSectionChange = (event) => {
    const { name, value } = event.target;

    setSectionForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setSectionError("");
  };

  // =========================================================
  // ADD SECTION
  // =========================================================

  const handleAddSection = () => {
    setEditingSectionId(null);

    setSectionForm({
      title: "",
      description: "",
      orderIndex: sections.length + 1,
    });

    setSectionError("");
    setShowSectionForm(true);
  };

  // =========================================================
  // CREATE SECTION
  // =========================================================

  const handleCreateSection = async (event) => {
    event.preventDefault();

    setSectionLoading(true);
    setSectionError("");

    try {
      const response = await api.post(`/courses/${courseId}/sections`, {
        title: sectionForm.title,
        description: sectionForm.description,
        orderIndex: Number(sectionForm.orderIndex),
      });

      setSections((previousSections) => {
        const updatedSections = [...previousSections, response.data];

        return updatedSections.sort((a, b) => a.orderIndex - b.orderIndex);
      });

      setShowSectionForm(false);

      setSectionForm({
        title: "",
        description: "",
        orderIndex: "",
      });
    } catch (err) {
      console.error("Failed to create section:", err);

      if (err.response?.status === 400) {
        setSectionError(
          "Please check the section details. The title or order may already exist.",
        );
      } else if (err.response?.status === 401) {
        setSectionError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setSectionError(
          "You do not have permission to create sections for this course.",
        );
      } else {
        setSectionError("Unable to create section. Please try again.");
      }
    } finally {
      setSectionLoading(false);
    }
  };

  // =========================================================
  // EDIT SECTION
  // =========================================================

  const handleEditSection = (section) => {
    setEditingSectionId(section.id);

    setSectionForm({
      title: section.title || "",
      description: section.description || "",
      orderIndex: section.orderIndex ?? "",
    });

    setSectionError("");
    setShowSectionForm(true);
  };

  // =========================================================
  // UPDATE SECTION
  // =========================================================

  const handleUpdateSection = async (event) => {
    event.preventDefault();

    setSectionLoading(true);
    setSectionError("");

    try {
      const response = await api.put(
        `/courses/${courseId}/sections/${editingSectionId}`,
        {
          title: sectionForm.title,
          description: sectionForm.description,
          orderIndex: Number(sectionForm.orderIndex),
        },
      );

      setSections((previousSections) => {
        const updatedSections = previousSections.map((section) =>
          section.id === editingSectionId ? response.data : section,
        );

        return updatedSections.sort((a, b) => a.orderIndex - b.orderIndex);
      });

      setShowSectionForm(false);
      setEditingSectionId(null);

      setSectionForm({
        title: "",
        description: "",
        orderIndex: "",
      });
    } catch (err) {
      console.error("Failed to update section:", err);

      if (err.response?.status === 400) {
        setSectionError("Please check the section details.");
      } else if (err.response?.status === 401) {
        setSectionError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setSectionError("You do not have permission to update this section.");
      } else if (err.response?.status === 404) {
        setSectionError("Section not found.");
      } else {
        setSectionError("Unable to update section. Please try again.");
      }
    } finally {
      setSectionLoading(false);
    }
  };

  // =========================================================
  // DELETE SECTION
  // =========================================================

  const handleDeleteSection = async (sectionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this section?",
    );

    if (!confirmed) {
      return;
    }

    setSectionLoading(true);
    setSectionError("");

    try {
      await api.delete(`/courses/${courseId}/sections/${sectionId}`);

      setSections((previousSections) =>
        previousSections.filter((section) => section.id !== sectionId),
      );
    } catch (err) {
      console.error("Failed to delete section:", err);

      if (err.response?.status === 401) {
        setSectionError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setSectionError("You do not have permission to delete this section.");
      } else if (err.response?.status === 404) {
        setSectionError("Section not found.");
      } else {
        setSectionError("Unable to delete section. Please try again.");
      }
    } finally {
      setSectionLoading(false);
    }
  };

  // =========================================================
  // SECTION TOGGLE
  // =========================================================

  const handleSectionToggle = (sectionId) => {
    setOpenSections((previousSections) => ({
      ...previousSections,
      [sectionId]: !previousSections[sectionId],
    }));
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-muted">Loading course manager...</p>
        </div>
      </main>
    );
  }

  // =========================================================
  // PAGE ERROR
  // =========================================================

  if (error && !course) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-600">{error}</p>

          <Link
            to="/instructor"
            className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Back to dashboard */}
        <Link
          to="/instructor"
          className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
        >
          ← Back to Instructor Dashboard
        </Link>

        {/* Course heading */}
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Course Management
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-3xl font-bold text-dark">{course.title}</h1>

              <div className="mt-3 flex items-center gap-3">
                {course.published ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Published
                  </span>
                ) : (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    Draft
                  </span>
                )}

                <span className="text-sm text-muted">₹{course.price}</span>
              </div>
            </div>

            {/* Analytics */}
            <Link
              to={`/instructor/courses/${courseId}/analytics`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-primary/20 bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:border-primary hover:bg-primary/5"
            >
              <span aria-hidden="true">📊</span>
              Course Analytics
            </Link>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* General error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* =====================================================
            COURSE DETAILS
        ====================================================== */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Course Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-dark">Edit Course</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
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
                className="h-12 w-full rounded-lg border border-gray-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

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
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

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
                  className="h-12 w-full rounded-lg border border-gray-200 pl-9 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        {/* =====================================================
            PUBLISHING
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Publishing
              </p>

              <h2 className="mt-1 text-xl font-bold text-dark">
                {course.published ? "Course is Published" : "Course is a Draft"}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                {course.published
                  ? "Students can discover and enroll in this course."
                  : "Publish the course when it is ready for students."}
              </p>
            </div>

            {!course.published && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="shrink-0 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {publishing ? "Publishing..." : "Publish Course"}
              </button>
            )}
          </div>
        </section>

        {/* =====================================================
            SECTIONS AND LESSONS
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Course Content
              </p>

              <h2 className="mt-1 text-xl font-bold text-dark">
                Sections & Lessons
              </h2>

              <p className="mt-2 text-sm text-muted">
                Build and organize your course curriculum.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSection}
              className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              + Add Section
            </button>
          </div>

          {/* ===================================================
              SECTION FORM
          ==================================================== */}

          {showSectionForm && (
            <div className="mt-6 rounded-xl border border-primary/10 bg-secondary/50 p-5">
              <p className="text-sm font-semibold text-primary">
                {editingSectionId ? "Edit Section" : "Create Section"}
              </p>

              <form
                onSubmit={
                  editingSectionId ? handleUpdateSection : handleCreateSection
                }
                className="mt-5 space-y-5"
              >
                <div>
                  <label
                    htmlFor="section-title"
                    className="mb-2 block text-sm font-semibold text-dark"
                  >
                    Section Title
                  </label>

                  <input
                    id="section-title"
                    name="title"
                    type="text"
                    value={sectionForm.title}
                    onChange={handleSectionChange}
                    placeholder="e.g. Java Fundamentals"
                    className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="section-description"
                    className="mb-2 block text-sm font-semibold text-dark"
                  >
                    Description
                  </label>

                  <textarea
                    id="section-description"
                    name="description"
                    value={sectionForm.description}
                    onChange={handleSectionChange}
                    rows={3}
                    placeholder="Describe this section..."
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    required
                  />
                </div>

                <div className="max-w-xs">
                  <label
                    htmlFor="section-order"
                    className="mb-2 block text-sm font-semibold text-dark"
                  >
                    Section Order
                  </label>

                  <input
                    id="section-order"
                    name="orderIndex"
                    type="number"
                    min="1"
                    value={sectionForm.orderIndex}
                    onChange={handleSectionChange}
                    className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    required
                  />
                </div>

                {sectionError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                    {sectionError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={sectionLoading}
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sectionLoading
                      ? "Saving..."
                      : editingSectionId
                        ? "Save Section"
                        : "Create Section"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSectionForm(false);
                      setEditingSectionId(null);
                      setSectionError("");
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section error */}
          {!showSectionForm && sectionError && (
            <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
              {sectionError}
            </div>
          )}

          {/* ===================================================
              SECTION LIST
          ==================================================== */}

          <div className="mt-6 space-y-4">
            {sections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <p className="font-semibold text-dark">No sections yet</p>

                <p className="mt-2 text-sm text-muted">
                  Add a section to start building your course.
                </p>
              </div>
            ) : (
              sections.map((section) => {
                const isOpen = Boolean(openSections[section.id]);

                return (
                  <div
                    key={section.id}
                    className="overflow-hidden rounded-xl border border-gray-200"
                  >
                    {/* Section header */}
                    <div className="flex flex-col gap-4 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => handleSectionToggle(section.id)}
                        className="flex flex-1 items-start gap-4 text-left"
                      >
                        {/* Section number */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                          {section.orderIndex}
                        </div>

                        {/* Section information */}
                        <div>
                          <h3 className="font-semibold text-dark">
                            {section.title}
                          </h3>

                          <p className="mt-1 text-sm text-muted">
                            {section.description}
                          </p>
                        </div>
                      </button>

                      {/* Section actions */}
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditSection(section)}
                          disabled={sectionLoading}
                          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary disabled:opacity-60"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSection(section.id)}
                          disabled={sectionLoading}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          Delete
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSectionToggle(section.id)}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-gray-500"
                        >
                          {isOpen ? "−" : "+"}
                        </button>
                      </div>
                    </div>

                    {/* Lessons */}
                    {isOpen && (
                      <>
                        <LessonManager sectionId={section.id} />

                        <QuizManager sectionId={section.id} />
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* =====================================================
            DANGER ZONE
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-red-500">
            Danger Zone
          </p>

          <h2 className="mt-1 text-xl font-bold text-dark">Delete Course</h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Deleting this course is permanent and cannot be undone.
          </p>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="mt-5 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete Course"}
          </button>
        </section>
      </div>
    </main>
  );
}

export default InstructorCourse;
