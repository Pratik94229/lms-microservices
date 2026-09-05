import { useEffect, useState } from "react";
import api from "../../api/axios";
import QuestionManager from "./QuestionManager";

// Manages quizzes belonging to one course section.
function QuizManager({ sectionId }) {
  // =========================================================
  // QUIZ STATE
  // =========================================================

  const [quizzes, setQuizzes] = useState([]);

  // Which quiz currently has its questions open.
  const [openQuizId, setOpenQuizId] = useState(null);

  // Which quiz is currently being edited.
  const [editingQuizId, setEditingQuizId] = useState(null);

  // =========================================================
  // FORM STATE
  // =========================================================

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    passingScore: 60,
    timeLimit: 30,
  });

  // =========================================================
  // PAGE STATE
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState(null);
  const [loadingEditQuizId, setLoadingEditQuizId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD QUIZZES
  // =========================================================

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError("");

      // Backend endpoint:
      // GET /api/quizzes/sections/{sectionId}
      const response = await api.get(`/quizzes/sections/${sectionId}`);

      const sortedQuizzes = [...(response.data || [])].sort((a, b) =>
        a.title.localeCompare(b.title),
      );

      setQuizzes(sortedQuizzes);
    } catch (err) {
      console.error("Failed to load quizzes:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view these quizzes.");
      } else if (err.response?.status === 404) {
        setError("Section not found.");
      } else {
        setError("Unable to load quizzes. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [sectionId]);

  // =========================================================
  // FORM CHANGE
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
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      passingScore: 60,
      timeLimit: 30,
    });

    setEditingQuizId(null);
  };

  // =========================================================
  // OPEN CREATE FORM
  // =========================================================

  const handleAddQuiz = () => {
    resetForm();

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEditQuiz = (quiz) => {
    setError("");
    setSuccess("");

    setForm({
      title: quiz.title || "",
      description: quiz.description || "",
      passingScore: quiz.passingScore ?? 60,
      timeLimit: quiz.timeLimit ?? 30,
    });

    setEditingQuizId(quiz.id);
    setShowForm(true);

    // Scroll to the form.
    setTimeout(() => {
      document.getElementById(`quiz-form-${sectionId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const handleCancelForm = () => {
    setShowForm(false);
    resetForm();
    setError("");
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    if (!form.title.trim()) {
      setError("Quiz title is required.");
      return false;
    }

    if (!form.description.trim()) {
      setError("Quiz description is required.");
      return false;
    }

    if (
      form.passingScore === "" ||
      Number(form.passingScore) < 0 ||
      Number(form.passingScore) > 100
    ) {
      setError("Passing score must be between 0 and 100.");
      return false;
    }

    if (form.timeLimit === "" || Number(form.timeLimit) <= 0) {
      setError("Time limit must be greater than 0.");
      return false;
    }

    return true;
  };

  // =========================================================
  // CREATE QUIZ
  // =========================================================

  const handleCreateQuiz = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Backend endpoint:
      // POST /api/quizzes/sections/{sectionId}
      await api.post(`/quizzes/sections/${sectionId}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        passingScore: Number(form.passingScore),
        timeLimit: Number(form.timeLimit),
      });

      // Reload from backend to keep ordering/data consistent.
      await fetchQuizzes();

      resetForm();

      setShowForm(false);

      setSuccess("Quiz created successfully.");
    } catch (err) {
      console.error("Failed to create quiz:", err);

      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message || "Please check the quiz details.",
        );
      } else if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to create quizzes.");
      } else if (err.response?.status === 404) {
        setError("Section not found.");
      } else {
        setError("Unable to create quiz. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // UPDATE QUIZ
  // =========================================================

  const handleUpdateQuiz = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    if (!editingQuizId) {
      setError("No quiz selected for editing.");
      return;
    }

    setSaving(true);

    try {
      // Backend endpoint:
      // PUT /api/quizzes/{quizId}
      await api.put(`/quizzes/${editingQuizId}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        passingScore: Number(form.passingScore),
        timeLimit: Number(form.timeLimit),
      });

      // Reload from backend.
      await fetchQuizzes();

      setShowForm(false);
      resetForm();

      setSuccess("Quiz updated successfully.");
    } catch (err) {
      console.error("Failed to update quiz:", err);

      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message || "Please check the quiz details.",
        );
      } else if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to update this quiz.");
      } else if (err.response?.status === 404) {
        setError("Quiz not found.");
      } else {
        setError("Unable to update quiz. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE QUIZ
  // =========================================================

  const handleDeleteQuiz = async (quizId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingQuizId(quizId);
    setError("");
    setSuccess("");

    try {
      // Backend endpoint:
      // DELETE /api/quizzes/{quizId}
      await api.delete(`/quizzes/${quizId}`);

      setQuizzes((previousQuizzes) =>
        previousQuizzes.filter((quiz) => quiz.id !== quizId),
      );

      if (openQuizId === quizId) {
        setOpenQuizId(null);
      }

      if (editingQuizId === quizId) {
        setShowForm(false);
        resetForm();
      }

      setSuccess("Quiz deleted successfully.");
    } catch (err) {
      console.error("Failed to delete quiz:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to delete this quiz.");
      } else if (err.response?.status === 404) {
        setError("Quiz not found.");
      } else {
        setError("Unable to delete quiz. Please try again.");
      }
    } finally {
      setDeletingQuizId(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="border-t border-gray-100 bg-gray-50 p-5">
        <p className="text-sm text-muted">Loading quizzes...</p>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="border-t border-gray-100 bg-gray-50 p-5">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Assessments
          </p>

          <h4 className="mt-1 text-lg font-bold text-dark">Quizzes</h4>

          <p className="mt-1 text-sm text-muted">
            Create quizzes and test your students.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddQuiz}
          disabled={saving || loadingEditQuizId !== null}
          className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          + Add Quiz
        </button>
      </div>

      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* =====================================================
          CREATE / EDIT FORM
      ====================================================== */}

      {showForm && (
        <div
          id={`quiz-form-${sectionId}`}
          className="mt-5 rounded-xl border border-primary/10 bg-white p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">
                {editingQuizId ? "Edit Quiz" : "Create Quiz"}
              </p>

              <p className="mt-1 text-xs text-muted">
                {editingQuizId
                  ? "Update the quiz information."
                  : "Create a new quiz for this section."}
              </p>
            </div>

            {editingQuizId && (
              <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                Editing
              </span>
            )}
          </div>

          <form
            onSubmit={editingQuizId ? handleUpdateQuiz : handleCreateQuiz}
            className="mt-5 space-y-5"
          >
            {/* =================================================
                TITLE
            ================================================== */}

            <div>
              <label
                htmlFor={`quiz-title-${sectionId}`}
                className="mb-2 block text-sm font-semibold text-dark"
              >
                Quiz Title
              </label>

              <input
                id={`quiz-title-${sectionId}`}
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Spring Basics Quiz"
                className="h-12 w-full rounded-lg border border-gray-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <div>
              <label
                htmlFor={`quiz-description-${sectionId}`}
                className="mb-2 block text-sm font-semibold text-dark"
              >
                Description
              </label>

              <textarea
                id={`quiz-description-${sectionId}`}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe this quiz..."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

            {/* =================================================
                PASSING SCORE + TIME LIMIT
            ================================================== */}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`quiz-passing-score-${sectionId}`}
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Passing Score (%)
                </label>

                <input
                  id={`quiz-passing-score-${sectionId}`}
                  name="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={form.passingScore}
                  onChange={handleChange}
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor={`quiz-time-limit-${sectionId}`}
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Time Limit (minutes)
                </label>

                <input
                  id={`quiz-time-limit-${sectionId}`}
                  name="timeLimit"
                  type="number"
                  min="1"
                  value={form.timeLimit}
                  onChange={handleChange}
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>
            </div>

            {/* =================================================
                FORM BUTTONS
            ================================================== */}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? editingQuizId
                    ? "Saving..."
                    : "Creating..."
                  : editingQuizId
                    ? "Save Changes"
                    : "Create Quiz"}
              </button>

              <button
                type="button"
                onClick={handleCancelForm}
                disabled={saving}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          QUIZ LIST
      ====================================================== */}

      <div className="mt-5 space-y-3">
        {quizzes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
            <p className="font-semibold text-dark">No quizzes yet</p>

            <p className="mt-1 text-sm text-muted">
              Create a quiz to assess your students.
            </p>
          </div>
        ) : (
          quizzes.map((quiz) => {
            const isOpen = openQuizId === quiz.id;

            return (
              <div
                key={quiz.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                {/* =================================================
                    QUIZ HEADER
                ================================================== */}

                <div className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h5 className="font-semibold text-dark">{quiz.title}</h5>

                      <p className="mt-1 text-sm text-muted">
                        {quiz.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          Passing: {quiz.passingScore}%
                        </span>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          Time: {quiz.timeLimit} min
                        </span>
                      </div>
                    </div>

                    {/* =================================================
                        QUIZ ACTIONS
                    ================================================== */}

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditQuiz(quiz)}
                        disabled={
                          saving ||
                          deletingQuizId !== null ||
                          loadingEditQuizId !== null
                        }
                        className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpenQuizId(isOpen ? null : quiz.id)}
                        disabled={saving || deletingQuizId !== null}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isOpen ? "Hide Questions" : "Manage Questions"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        disabled={
                          deletingQuizId === quiz.id ||
                          saving ||
                          loadingEditQuizId !== null
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingQuizId === quiz.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    QUESTION MANAGER
                ================================================== */}

                {isOpen && <QuestionManager quizId={quiz.id} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default QuizManager;
