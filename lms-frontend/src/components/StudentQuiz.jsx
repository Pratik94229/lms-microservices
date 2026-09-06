import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function StudentQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [error, setError] = useState("");

  /*
   * Prevent the same attempt from being automatically
   * submitted more than once.
   *
   * This is especially important with React StrictMode,
   * which can execute effects more than once in development.
   */
  const autoSubmitAttemptId = useRef(null);

  /*
   * Prevent duplicate start requests.
   */
  const startRequestInProgress = useRef(false);

  /*
   * =========================================================
   * BACKEND DATE/TIME PARSER
   * =========================================================
   *
   * Backend currently returns LocalDateTime values such as:
   *
   * 2026-09-06T15:30:00
   *
   * LocalDateTime has NO timezone information.
   *
   * Our Spring Boot/Render backend runs in UTC, so a timezone-less
   * backend timestamp must be treated as UTC.
   *
   * If the backend later returns:
   *
   * 2026-09-06T15:30:00Z
   *
   * or:
   *
   * 2026-09-06T15:30:00+05:30
   *
   * those timestamps are already timezone-aware and should be
   * parsed normally.
   */
  const parseBackendDateTime = (value) => {
    if (!value) {
      return null;
    }

    const stringValue = String(value).trim();

    if (!stringValue) {
      return null;
    }

    /*
     * Already timezone-aware:
     *
     * 2026-09-06T15:30:00Z
     * 2026-09-06T15:30:00+05:30
     */
    if (stringValue.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(stringValue)) {
      const date = new Date(stringValue);

      return Number.isNaN(date.getTime()) ? null : date;
    }

    /*
     * Backend LocalDateTime has no timezone.
     *
     * Explicitly treat it as UTC.
     */
    const utcDate = new Date(`${stringValue}Z`);

    return Number.isNaN(utcDate.getTime()) ? null : utcDate;
  };

  /*
   * =========================================================
   * LOAD QUIZ
   * =========================================================
   */
  useEffect(() => {
    let cancelled = false;

    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError("");

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          if (!cancelled) {
            setError("Please login before taking this quiz.");
          }
          return;
        }

        /*
         * Load quiz.
         */
        const quizResponse = await api.get(`/quizzes/${quizId}`);

        if (cancelled) {
          return;
        }

        setQuiz(quizResponse.data);

        /*
         * Check for an existing active attempt.
         */
        try {
          const activeAttemptResponse = await api.get(
            `/quizzes/${quizId}/attempts/active`,
          );

          if (cancelled) {
            return;
          }

          /*
           * 200 + attempt = active attempt exists.
           */
          if (
            activeAttemptResponse.status === 200 &&
            activeAttemptResponse.data
          ) {
            setAttempt(activeAttemptResponse.data);
          }
        } catch (activeAttemptError) {
          /*
           * 404 means there is no active attempt.
           *
           * This is normal for a new quiz.
           */
          if (activeAttemptError.response?.status === 404) {
            return;
          }

          /*
           * 204 can also mean no active attempt.
           */
          if (activeAttemptError.response?.status === 204) {
            return;
          }

          throw activeAttemptError;
        }
      } catch (err) {
        console.error("Failed to load quiz:", err);

        if (cancelled) {
          return;
        }

        if (err.response?.status === 401) {
          setError("Your login session is invalid or expired.");
        } else if (err.response?.status === 403) {
          setError("You are not enrolled in this course.");
        } else if (err.response?.status === 404) {
          setError("Quiz not found.");
        } else {
          setError("Unable to load quiz. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadQuiz();

    return () => {
      cancelled = true;
    };
  }, [quizId]);

  /*
   * =========================================================
   * LOAD SAVED ANSWERS
   * =========================================================
   */
  useEffect(() => {
    let cancelled = false;

    const loadSavedAnswers = async () => {
      if (!attempt?.id || submitted) {
        return;
      }

      try {
        const response = await api.get(`/attempts/${attempt.id}/answers`);

        if (cancelled) {
          return;
        }

        const answerMap = {};

        (response.data || []).forEach((answer) => {
          if (answer.questionId && answer.selectedOptionId) {
            answerMap[answer.questionId] = answer.selectedOptionId;
          }
        });

        setSavedAnswers(answerMap);
      } catch (err) {
        console.error("Failed to load saved answers:", err);

        if (cancelled) {
          return;
        }

        if (err.response?.status === 401) {
          setError("Your login session is invalid or expired.");
        } else if (err.response?.status === 403) {
          setError("You do not have access to this attempt.");
        } else if (err.response?.status === 404) {
          setError("Quiz attempt not found.");
        } else {
          setError("Unable to restore your saved answers.");
        }
      }
    };

    loadSavedAnswers();

    return () => {
      cancelled = true;
    };
  }, [attempt?.id, submitted]);

  /*
   * =========================================================
   * QUESTIONS
   * =========================================================
   */
  const questions = useMemo(() => {
    return [...(quiz?.questions || [])].sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );
  }, [quiz]);

  /*
   * =========================================================
   * ANSWER COUNT
   * =========================================================
   */
  const answeredCount = Object.keys(savedAnswers).length;

  /*
   * =========================================================
   * FORMAT TIMER
   * =========================================================
   */
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined || seconds < 0) {
      return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
      2,
      "0",
    )}`;
  };

  /*
   * =========================================================
   * SUBMIT QUIZ
   * =========================================================
   */
  const submitQuiz = async (confirmSubmission = true) => {
    if (!attempt?.id || submitting || submitted) {
      return;
    }

    /*
     * Manual submission confirmation.
     */
    if (confirmSubmission) {
      const confirmed = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions.\n\nAre you sure you want to submit the quiz?`,
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post(`/attempts/${attempt.id}/submit`);

      /*
       * Store final result.
       */
      setResult(response.data);
      setAttempt(response.data);
      setSubmitted(true);
      setRemainingSeconds(0);
    } catch (err) {
      console.error("Failed to submit quiz:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to submit this quiz.");
      } else if (err.response?.status === 404) {
        setError("Quiz attempt not found.");
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Unable to submit the quiz. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * =========================================================
   * QUIZ TIMER
   * =========================================================
   *
   * Timer is based on:
   *
   * attempt.startedAt + quiz.timeLimit
   *
   * IMPORTANT:
   *
   * The backend LocalDateTime is treated as UTC.
   *
   * This prevents the browser's India timezone from incorrectly
   * making the quiz appear expired immediately.
   */
  useEffect(() => {
    if (!attempt?.id || !attempt?.startedAt || !quiz?.timeLimit || submitted) {
      setRemainingSeconds(null);
      return undefined;
    }

    /*
     * Parse backend timestamp correctly.
     */
    const startedAt = parseBackendDateTime(attempt.startedAt);

    /*
     * NEVER automatically submit if the timestamp is invalid.
     *
     * This is very important.
     */
    if (!startedAt) {
      console.error("Invalid quiz attempt startedAt:", attempt.startedAt);

      setRemainingSeconds(null);
      setError(
        "Unable to calculate the quiz timer. Please refresh and try again.",
      );

      return undefined;
    }

    const timeLimitMinutes = Number(quiz.timeLimit);

    /*
     * Invalid time limit should never trigger submission.
     */
    if (!Number.isFinite(timeLimitMinutes) || timeLimitMinutes <= 0) {
      setRemainingSeconds(null);
      return undefined;
    }

    /*
     * Calculate the exact expiry time.
     */
    const endTime = startedAt.getTime() + timeLimitMinutes * 60 * 1000;

    /*
     * Calculate remaining time.
     */
    const calculateRemainingTime = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

      setRemainingSeconds(remaining);

      return remaining;
    };

    /*
     * Initial timer calculation.
     */
    const initialRemaining = calculateRemainingTime();

    /*
     * =======================================================
     * ALREADY EXPIRED
     * =======================================================
     *
     * Only submit when we KNOW the calculated time is actually
     * zero or less.
     */
    if (Number.isFinite(initialRemaining) && initialRemaining <= 0) {
      /*
       * Prevent duplicate automatic submissions.
       */
      if (autoSubmitAttemptId.current !== attempt.id) {
        autoSubmitAttemptId.current = attempt.id;

        submitQuiz(false);
      }

      return undefined;
    }

    /*
     * =======================================================
     * RUN TIMER
     * =======================================================
     */
    const timer = setInterval(() => {
      const remaining = calculateRemainingTime();

      /*
       * Only auto-submit when remaining time is genuinely zero.
       */
      if (Number.isFinite(remaining) && remaining <= 0) {
        clearInterval(timer);

        /*
         * Prevent duplicate automatic submission.
         */
        if (autoSubmitAttemptId.current !== attempt.id) {
          autoSubmitAttemptId.current = attempt.id;

          submitQuiz(false);
        }
      }
    }, 1000);

    /*
     * Cleanup timer.
     */
    return () => {
      clearInterval(timer);
    };
  }, [attempt?.id, attempt?.startedAt, quiz?.timeLimit, submitted]);

  /*
   * =========================================================
   * START QUIZ
   * =========================================================
   */
  const handleStartQuiz = async () => {
    /*
     * Prevent duplicate requests.
     */
    if (starting || startRequestInProgress.current || attempt?.id) {
      return;
    }

    /*
     * Quiz must contain questions.
     */
    if (questions.length === 0) {
      setError("This quiz does not have any questions yet.");
      return;
    }

    try {
      startRequestInProgress.current = true;

      setStarting(true);
      setError("");

      const response = await api.post(`/quizzes/${quizId}/attempts`);

      if (response.data) {
        /*
         * Reset quiz state for new attempt.
         */
        setAttempt(response.data);
        setSavedAnswers({});
        setSubmitted(false);
        setResult(null);
        setRemainingSeconds(null);

        /*
         * Allow this attempt to use automatic submission.
         */
        autoSubmitAttemptId.current = null;
      }
    } catch (err) {
      console.error("Failed to start quiz:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You are not enrolled in this course.");
      } else if (err.response?.status === 404) {
        setError("Quiz not found.");
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Unable to start the quiz. Please try again.",
        );
      }
    } finally {
      setStarting(false);
      startRequestInProgress.current = false;
    }
  };

  /*
   * =========================================================
   * SAVE / UPDATE ANSWER
   * =========================================================
   */
  const handleAnswerChange = async (questionId, selectedOptionId) => {
    if (!attempt?.id || submitted) {
      return;
    }

    const previousAnswer = savedAnswers[questionId];

    /*
     * Update UI immediately.
     */
    setSavedAnswers((previous) => ({
      ...previous,
      [questionId]: selectedOptionId,
    }));

    try {
      setSavingQuestionId(questionId);
      setError("");

      await api.post(`/attempts/${attempt.id}/answers`, {
        questionId,
        selectedOptionId,
      });
    } catch (err) {
      console.error("Failed to save answer:", err);

      /*
       * Restore previous answer if saving failed.
       */
      setSavedAnswers((previous) => {
        const updated = { ...previous };

        if (previousAnswer) {
          updated[questionId] = previousAnswer;
        } else {
          delete updated[questionId];
        }

        return updated;
      });

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to answer this quiz.");
      } else if (err.response?.status === 404) {
        setError("Quiz attempt not found.");
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Unable to save your answer. Please try again.",
        );
      }
    } finally {
      setSavingQuestionId(null);
    }
  };

  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   */
  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-secondary">
        <p className="text-muted">Loading quiz...</p>
      </main>
    );
  }

  /*
   * =========================================================
   * ERROR STATE
   * =========================================================
   */
  if (error && !quiz) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-medium text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * QUIZ NOT FOUND
   * =========================================================
   */
  if (!quiz) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-secondary">
        <p className="text-muted">Quiz not found.</p>
      </main>
    );
  }

  /*
   * =========================================================
   * QUIZ RESULT
   * =========================================================
   */
  if (submitted && result) {
    const passed = Boolean(result.passed);

    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/my-learning"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to My Learning
          </Link>

          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div
              className={`px-8 py-10 text-white ${
                passed ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
                Quiz Result
              </p>

              <h1 className="mt-2 text-3xl font-bold">{quiz.title}</h1>

              <p className="mt-3 text-lg font-semibold">
                {passed ? "🎉 Congratulations! You passed." : "Quiz not passed"}
              </p>
            </div>

            <div className="p-8">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted">
                  Your Score
                </p>

                <p
                  className={`mt-2 text-6xl font-bold ${
                    passed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Number(result.percentage ?? 0).toFixed(2)}%
                </p>

                <p className="mt-2 text-sm text-muted">
                  {result.score ?? 0} / {result.totalMarks ?? 0} marks
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Score
                  </p>

                  <p className="mt-2 text-xl font-bold text-dark">
                    {result.score ?? 0}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Passing Score
                  </p>

                  <p className="mt-2 text-xl font-bold text-dark">
                    {quiz.passingScore}%
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Status
                  </p>

                  <p
                    className={`mt-2 text-xl font-bold ${
                      passed ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {passed ? "PASSED" : "FAILED"}
                  </p>
                </div>
              </div>

              {result.submittedAt && (
                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-sm text-muted">
                  Submitted on {new Date(result.submittedAt).toLocaleString()}
                </div>
              )}

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/my-learning"
                  className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  Back to My Learning
                </Link>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-lg border border-gray-200 bg-white px-6 py-3 font-semibold text-dark transition hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * QUIZ INTRODUCTION
   * =========================================================
   */
  if (!attempt) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back
          </button>

          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="bg-primary px-8 py-10 text-white">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
                Quiz
              </p>

              <h1 className="mt-2 text-3xl font-bold">{quiz.title}</h1>

              {quiz.description && (
                <p className="mt-4 max-w-2xl leading-7 text-white/80">
                  {quiz.description}
                </p>
              )}
            </div>

            <div className="p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Questions
                  </p>

                  <p className="mt-2 text-2xl font-bold text-dark">
                    {questions.length}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Passing Score
                  </p>

                  <p className="mt-2 text-2xl font-bold text-dark">
                    {quiz.passingScore}%
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Time Limit
                  </p>

                  <p className="mt-2 text-2xl font-bold text-dark">
                    {quiz.timeLimit ? `${quiz.timeLimit} min` : "No limit"}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                <p className="font-semibold text-yellow-800">
                  Before you start
                </p>

                <p className="mt-2 text-sm leading-6 text-yellow-700">
                  Make sure you are ready before starting the quiz. Your answers
                  will be saved as you select them.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartQuiz}
                disabled={starting || questions.length === 0}
                className="mt-8 rounded-lg bg-primary px-7 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {starting ? "Starting..." : "Start Quiz"}
              </button>

              {questions.length === 0 && (
                <p className="mt-3 text-sm text-red-600">
                  This quiz does not have any questions yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * ACTIVE QUIZ
   * =========================================================
   */
  const timerIsLow = remainingSeconds !== null && remainingSeconds <= 60;

  return (
    <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Quiz
              </p>

              <h1 className="mt-1 text-2xl font-bold text-dark">
                {quiz.title}
              </h1>

              {quiz.description && (
                <p className="mt-2 text-sm leading-6 text-muted">
                  {quiz.description}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {/* Answered */}
              <div className="shrink-0 rounded-lg bg-primary/10 px-4 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Answered
                </p>

                <p className="mt-1 text-xl font-bold text-dark">
                  {answeredCount}/{questions.length}
                </p>
              </div>

              {/* Timer */}
              {quiz.timeLimit && (
                <div
                  className={`shrink-0 rounded-lg px-4 py-3 text-center ${
                    timerIsLow ? "bg-red-100" : "bg-gray-100"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      timerIsLow ? "text-red-600" : "text-muted"
                    }`}
                  >
                    Time Remaining
                  </p>

                  <p
                    className={`mt-1 text-xl font-bold ${
                      timerIsLow ? "text-red-600" : "text-dark"
                    }`}
                  >
                    {formatTime(remainingSeconds)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timer progress bar */}
          {quiz.timeLimit && remainingSeconds !== null && (
            <div className="mt-5">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    timerIsLow ? "bg-red-500" : "bg-primary"
                  }`}
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(
                        100,
                        (remainingSeconds / (Number(quiz.timeLimit) * 60)) *
                          100,
                      ),
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Questions */}
        <div className="mt-6 space-y-5">
          {questions.map((question, questionIndex) => {
            const selectedOptionId = savedAnswers[question.id];

            const sortedOptions = [...(question.options || [])].sort(
              (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
            );

            return (
              <div
                key={question.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {questionIndex + 1}
                  </span>

                  <div className="min-w-0">
                    <p className="font-semibold leading-7 text-dark">
                      {question.questionText}
                    </p>

                    <p className="mt-1 text-xs font-medium text-muted">
                      {question.marks} marks
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {sortedOptions.map((option, optionIndex) => {
                    const isSelected = selectedOptionId === option.id;

                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary/30 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          checked={isSelected}
                          onChange={() =>
                            handleAnswerChange(question.id, option.id)
                          }
                          disabled={
                            savingQuestionId === question.id || submitting
                          }
                          className="h-4 w-4 accent-primary"
                        />

                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </span>

                        <span className="text-sm leading-6 text-dark">
                          {option.optionText}
                        </span>

                        {savingQuestionId === question.id && isSelected && (
                          <span className="ml-auto text-xs font-medium text-muted">
                            Saving...
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-dark">Ready to submit?</p>

              <p className="mt-1 text-sm text-muted">
                You have answered{" "}
                <span className="font-semibold text-dark">{answeredCount}</span>{" "}
                of{" "}
                <span className="font-semibold text-dark">
                  {questions.length}
                </span>{" "}
                questions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => submitQuiz(true)}
              disabled={submitting || savingQuestionId !== null}
              className="shrink-0 rounded-lg bg-primary px-7 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs leading-5 text-yellow-700">
            When the timer reaches 00:00, the quiz will be submitted
            automatically.
          </div>
        </div>
      </div>
    </main>
  );
}

export default StudentQuiz;
