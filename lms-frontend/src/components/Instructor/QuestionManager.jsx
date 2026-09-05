import { useEffect, useState } from "react";
import api from "../../api/axios";

// Manages questions belonging to one quiz.
function QuestionManager({ quizId }) {
  // =========================================================
  // QUESTIONS
  // =========================================================

  const [questions, setQuestions] = useState([]);

  // =========================================================
  // FORM
  // =========================================================

  const [showForm, setShowForm] = useState(false);

  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const [loadingQuestionId, setLoadingQuestionId] = useState(null);

  const [form, setForm] = useState({
    questionText: "",
    type: "MCQ_SINGLE",
    orderIndex: "",
    marks: 5,
  });

  const [options, setOptions] = useState([
    {
      optionText: "",
      orderIndex: 1,
      correct: true,
    },
    {
      optionText: "",
      orderIndex: 2,
      correct: false,
    },
    {
      optionText: "",
      orderIndex: 3,
      correct: false,
    },
    {
      optionText: "",
      orderIndex: 4,
      correct: false,
    },
  ]);

  // =========================================================
  // PAGE STATE
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // DEFAULT OPTIONS
  // =========================================================

  const getDefaultOptions = () => [
    {
      optionText: "",
      orderIndex: 1,
      correct: true,
    },
    {
      optionText: "",
      orderIndex: 2,
      correct: false,
    },
    {
      optionText: "",
      orderIndex: 3,
      correct: false,
    },
    {
      optionText: "",
      orderIndex: 4,
      correct: false,
    },
  ];

  // =========================================================
  // LOAD QUESTIONS
  // =========================================================

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/quizzes/${quizId}/questions`);

      const sortedQuestions = [...(response.data || [])].sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );

      setQuestions(sortedQuestions);
    } catch (err) {
      console.error("Failed to load questions:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view these questions.");
      } else if (err.response?.status === 404) {
        setError("Quiz not found.");
      } else {
        setError("Unable to load questions. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // OPTION CHANGE
  // =========================================================

  const handleOptionChange = (index, value) => {
    setOptions((previousOptions) =>
      previousOptions.map((option, optionIndex) =>
        optionIndex === index
          ? {
              ...option,
              optionText: value,
            }
          : option,
      ),
    );

    setError("");
    setSuccess("");
  };

  // =========================================================
  // CORRECT OPTION
  // =========================================================

  const handleCorrectOptionChange = (index) => {
    setOptions((previousOptions) =>
      previousOptions.map((option, optionIndex) => ({
        ...option,
        correct: optionIndex === index,
      })),
    );

    setError("");
    setSuccess("");
  };

  // =========================================================
  // GET NEXT QUESTION ORDER
  // =========================================================

  const getNextQuestionOrder = () => {
    if (questions.length === 0) {
      return 1;
    }

    const highestOrder = Math.max(
      ...questions.map((question) => Number(question.orderIndex) || 0),
    );

    return highestOrder + 1;
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const handleAddQuestion = () => {
    setEditingQuestionId(null);

    setForm({
      questionText: "",
      type: "MCQ_SINGLE",
      orderIndex: getNextQuestionOrder(),
      marks: 5,
    });

    setOptions(getDefaultOptions());

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEditQuestion = async (questionId) => {
    setError("");
    setSuccess("");
    setLoadingQuestionId(questionId);

    try {
      // -------------------------------------------------------
      // Instructor-only endpoint.
      //
      // This endpoint includes the correct flag.
      // -------------------------------------------------------

      const response = await api.get(`/questions/${questionId}/details`);

      const question = response.data;

      // -------------------------------------------------------
      // Populate question fields.
      // -------------------------------------------------------

      setForm({
        questionText: question.questionText || "",
        type: question.type || "MCQ_SINGLE",
        orderIndex: question.orderIndex || "",
        marks: question.marks || 5,
      });

      // -------------------------------------------------------
      // Populate options including correct answer.
      // -------------------------------------------------------

      const loadedOptions = [...(question.options || [])]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((option) => ({
          optionText: option.optionText || "",
          orderIndex: option.orderIndex,
          correct: Boolean(option.correct),
        }));

      setOptions(loadedOptions);

      setEditingQuestionId(questionId);
      setShowForm(true);

      // Scroll the form into view after it opens.
      setTimeout(() => {
        document.getElementById(`question-form-${quizId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    } catch (err) {
      console.error("Failed to load question details:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to edit this question.");
      } else if (err.response?.status === 404) {
        setError("Question not found.");
      } else {
        setError("Unable to load question details. Please try again.");
      }
    } finally {
      setLoadingQuestionId(null);
    }
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingQuestionId(null);
    setError("");
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    if (!form.questionText.trim()) {
      setError("Question text is required.");
      return false;
    }

    if (!form.orderIndex || Number(form.orderIndex) < 1) {
      setError("Question order must be at least 1.");
      return false;
    }

    if (!form.marks || Number(form.marks) <= 0) {
      setError("Marks must be greater than 0.");
      return false;
    }

    if (options.length !== 4) {
      setError("Exactly four options are required.");
      return false;
    }

    const hasEmptyOption = options.some((option) => !option.optionText.trim());

    if (hasEmptyOption) {
      setError("All four options are required.");
      return false;
    }

    const correctOptionCount = options.filter(
      (option) => option.correct,
    ).length;

    if (correctOptionCount !== 1) {
      setError("Please select exactly one correct option.");
      return false;
    }

    return true;
  };

  // =========================================================
  // CREATE QUESTION
  // =========================================================

  const handleCreateQuestion = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.post(`/quizzes/${quizId}/questions`, {
        questionText: form.questionText.trim(),
        type: form.type,
        orderIndex: Number(form.orderIndex),
        marks: Number(form.marks),
        options: options.map((option) => ({
          optionText: option.optionText.trim(),
          orderIndex: option.orderIndex,
          correct: option.correct,
        })),
      });

      // -------------------------------------------------------
      // Reload questions so the new question and its options
      // are immediately visible.
      // -------------------------------------------------------

      await fetchQuestions();

      setForm({
        questionText: "",
        type: "MCQ_SINGLE",
        orderIndex: getNextQuestionOrder(),
        marks: 5,
      });

      setOptions(getDefaultOptions());

      setShowForm(false);
      setEditingQuestionId(null);

      setSuccess("Question created successfully.");
    } catch (err) {
      console.error("Failed to create question:", err);

      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message || "Please check the question details.",
        );
      } else if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to create questions.");
      } else if (err.response?.status === 404) {
        setError("Quiz not found.");
      } else {
        setError("Unable to create question. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // UPDATE QUESTION
  // =========================================================

  const handleUpdateQuestion = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.put(`/questions/${editingQuestionId}`, {
        questionText: form.questionText.trim(),
        type: form.type,
        orderIndex: Number(form.orderIndex),
        marks: Number(form.marks),
        options: options.map((option) => ({
          optionText: option.optionText.trim(),
          orderIndex: option.orderIndex,
          correct: option.correct,
        })),
      });

      // -------------------------------------------------------
      // Reload questions after update.
      // -------------------------------------------------------

      await fetchQuestions();

      setShowForm(false);
      setEditingQuestionId(null);

      setSuccess("Question updated successfully.");
    } catch (err) {
      console.error("Failed to update question:", err);

      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message || "Please check the question details.",
        );
      } else if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to update this question.");
      } else if (err.response?.status === 404) {
        setError("Question not found.");
      } else {
        setError("Unable to update question. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // FORM SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editingQuestionId) {
      await handleUpdateQuestion();
    } else {
      await handleCreateQuestion();
    }
  };

  // =========================================================
  // DELETE QUESTION
  // =========================================================

  const handleDeleteQuestion = async (questionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingQuestionId(questionId);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/questions/${questionId}`);

      setQuestions((previousQuestions) =>
        previousQuestions.filter((question) => question.id !== questionId),
      );

      // If the deleted question was being edited,
      // close the edit form.
      if (editingQuestionId === questionId) {
        setShowForm(false);
        setEditingQuestionId(null);
      }

      setSuccess("Question deleted successfully.");
    } catch (err) {
      console.error("Failed to delete question:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to delete this question.");
      } else if (err.response?.status === 404) {
        setError("Question not found.");
      } else {
        setError("Unable to delete question. Please try again.");
      }
    } finally {
      setDeletingQuestionId(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="border-t border-gray-100 bg-gray-50 p-5">
        <p className="text-sm text-muted">Loading questions...</p>
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
            Quiz Builder
          </p>

          <h5 className="mt-1 text-lg font-bold text-dark">Questions</h5>

          <p className="mt-1 text-sm text-muted">
            Add questions and define their correct answers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddQuestion}
          disabled={saving || loadingQuestionId !== null}
          className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          + Add Question
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
          QUESTION FORM
      ====================================================== */}

      {showForm && (
        <div
          id={`question-form-${quizId}`}
          className="mt-5 rounded-xl border border-primary/10 bg-white p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">
                {editingQuestionId ? "Edit Question" : "Add Question"}
              </p>

              <p className="mt-1 text-xs text-muted">
                {editingQuestionId
                  ? "Update the question, options, and correct answer."
                  : "Create a new multiple-choice question."}
              </p>
            </div>

            {editingQuestionId && (
              <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                Editing
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* =================================================
                QUESTION TEXT
            ================================================== */}

            <div>
              <label
                htmlFor={`question-text-${quizId}`}
                className="mb-2 block text-sm font-semibold text-dark"
              >
                Question
              </label>

              <textarea
                id={`question-text-${quizId}`}
                name="questionText"
                value={form.questionText}
                onChange={handleFormChange}
                placeholder="Enter your question..."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

            {/* =================================================
                TYPE + MARKS + ORDER
            ================================================== */}

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label
                  htmlFor={`question-type-${quizId}`}
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Question Type
                </label>

                <select
                  id={`question-type-${quizId}`}
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="MCQ_SINGLE">MCQ - Single Answer</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor={`question-marks-${quizId}`}
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Marks
                </label>

                <input
                  id={`question-marks-${quizId}`}
                  name="marks"
                  type="number"
                  min="1"
                  value={form.marks}
                  onChange={handleFormChange}
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor={`question-order-${quizId}`}
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Question Order
                </label>

                <input
                  id={`question-order-${quizId}`}
                  name="orderIndex"
                  type="number"
                  min="1"
                  value={form.orderIndex}
                  onChange={handleFormChange}
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>
            </div>

            {/* =================================================
                OPTIONS
            ================================================== */}

            <div>
              <div className="mb-3">
                <p className="text-sm font-semibold text-dark">
                  Answer Options
                </p>

                <p className="mt-1 text-xs text-muted">
                  Select the radio button beside the correct answer.
                </p>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div
                    key={option.orderIndex}
                    className={`flex items-center gap-3 rounded-lg p-1 ${
                      option.correct ? "bg-green-50" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`correct-option-${quizId}`}
                      checked={option.correct}
                      onChange={() => handleCorrectOptionChange(index)}
                      className="h-4 w-4 accent-primary"
                    />

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                        option.correct
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>

                    <input
                      type="text"
                      value={option.optionText}
                      onChange={(event) =>
                        handleOptionChange(index, event.target.value)
                      }
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="h-11 flex-1 rounded-lg border border-gray-200 px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      required
                    />

                    {option.correct && (
                      <span className="hidden text-xs font-semibold text-green-600 sm:block">
                        Correct
                      </span>
                    )}
                  </div>
                ))}
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
                  ? editingQuestionId
                    ? "Saving..."
                    : "Creating..."
                  : editingQuestionId
                    ? "Save Changes"
                    : "Create Question"}
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
          QUESTION LIST
      ====================================================== */}

      <div className="mt-5 space-y-4">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
            <p className="font-semibold text-dark">No questions yet</p>

            <p className="mt-1 text-sm text-muted">
              Add your first question to this quiz.
            </p>
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              {/* =================================================
                  QUESTION HEADER
              ================================================== */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {question.orderIndex}
                  </div>

                  <div>
                    <p className="font-semibold text-dark">
                      {question.questionText}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {question.type}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {question.marks} marks
                      </span>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    ACTION BUTTONS
                ================================================== */}

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditQuestion(question.id)}
                    disabled={
                      loadingQuestionId === question.id ||
                      saving ||
                      deletingQuestionId !== null
                    }
                    className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingQuestionId === question.id ? "Loading..." : "Edit"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(question.id)}
                    disabled={
                      deletingQuestionId === question.id ||
                      saving ||
                      loadingQuestionId !== null
                    }
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingQuestionId === question.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>

              {/* =================================================
                  OPTIONS
              ================================================== */}

              {question.options && question.options.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {[...question.options]
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((option, index) => (
                      <div
                        key={option.id}
                        className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                      >
                        <span className="mr-2 font-semibold text-primary">
                          {String.fromCharCode(65 + index)}.
                        </span>

                        {option.optionText}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default QuestionManager;
