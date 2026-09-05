import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function QuizResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError("");

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          navigate("/login");
          return;
        }

        /*
         * Load all student attempts first.
         *
         * This lets us get the score, percentage, status,
         * submission time, etc. for this particular attempt.
         */
        const attemptsResponse = await api.get("/quizzes/attempts/my");

        const attempts = attemptsResponse.data || [];

        const currentAttempt = attempts.find((item) => item.id === attemptId);

        if (!currentAttempt) {
          setError("Quiz attempt not found.");
          return;
        }

        /*
         * Do not allow an in-progress attempt to open
         * the result page.
         */
        if (currentAttempt.status === "IN_PROGRESS") {
          setError("Quiz result is available only after submission.");
          return;
        }

        setAttempt(currentAttempt);

        /*
         * Load quiz information.
         */
        const quizResponse = await api.get(`/quizzes/${currentAttempt.quizId}`);

        setQuiz(quizResponse.data);

        /*
         * Load question-by-question result.
         */
        const resultResponse = await api.get(`/attempts/${attemptId}/result`);

        setQuestions(resultResponse.data || []);
      } catch (err) {
        console.error("Failed to load quiz result:", err);

        if (err.response?.status === 401) {
          setError("Your login session is invalid or expired.");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to view this result.");
        } else if (err.response?.status === 404) {
          setError("Quiz result not found.");
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load quiz result. Please try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId, navigate]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-secondary px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-muted">Loading quiz result...</p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */
  if (error) {
    return (
      <main className="min-h-screen bg-secondary px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
              !
            </div>

            <h1 className="mt-4 text-xl font-bold text-dark">
              Unable to Load Result
            </h1>

            <p className="mt-2 text-sm text-red-500">{error}</p>

            <Link
              to="/my-learning"
              className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              Back to My Learning
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!attempt) {
    return null;
  }

  const percentage = Number.isFinite(Number(attempt.percentage))
    ? Math.min(Math.max(Number(attempt.percentage), 0), 100)
    : 0;

  const passed = attempt.passed === true;

  return (
    <main className="min-h-screen bg-secondary px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* ======================================================
            BACK BUTTON
            ====================================================== */}
        <Link
          to="/my-learning"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          ← Back to My Learning
        </Link>

        {/* ======================================================
            RESULT HEADER
            ====================================================== */}
        <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div
            className={`px-6 py-8 md:px-10 ${
              passed
                ? "bg-gradient-to-r from-green-50 to-white"
                : "bg-gradient-to-r from-red-50 to-white"
            }`}
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Quiz Result
                </p>

                <h1 className="mt-2 text-3xl font-bold text-dark">
                  {quiz?.title || "Quiz"}
                </h1>

                {quiz?.description && (
                  <p className="mt-2 max-w-2xl text-sm text-muted">
                    {quiz.description}
                  </p>
                )}

                {attempt.submittedAt && (
                  <p className="mt-3 text-xs text-muted">
                    Submitted on{" "}
                    {new Date(attempt.submittedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div
                className={`flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-8 ${
                  passed
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <span
                  className={`text-2xl font-bold ${
                    passed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {percentage.toFixed(0)}%
                </span>

                <span
                  className={`mt-1 text-xs font-semibold ${
                    passed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {passed ? "PASSED" : "FAILED"}
                </span>
              </div>
            </div>
          </div>

          {/* ====================================================
              SCORE SUMMARY
              ==================================================== */}
          <div className="grid border-t border-gray-100 sm:grid-cols-3">
            <div className="border-b border-gray-100 px-6 py-5 text-center sm:border-b-0 sm:border-r">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Score
              </p>

              <p className="mt-1 text-2xl font-bold text-dark">
                {attempt.score ?? 0}
                {attempt.totalMarks != null ? ` / ${attempt.totalMarks}` : ""}
              </p>
            </div>

            <div className="border-b border-gray-100 px-6 py-5 text-center sm:border-b-0 sm:border-r">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Percentage
              </p>

              <p
                className={`mt-1 text-2xl font-bold ${
                  passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {percentage.toFixed(2)}%
              </p>
            </div>

            <div className="px-6 py-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Passing Score
              </p>

              <p className="mt-1 text-2xl font-bold text-dark">
                {quiz?.passingScore != null ? `${quiz.passingScore}%` : "-"}
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================
            QUESTION RESULTS
            ====================================================== */}
        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-dark">Question Review</h2>

            <p className="mt-1 text-sm text-muted">
              Review your answers and compare them with the correct answers.
            </p>
          </div>

          <div className="space-y-5">
            {questions.map((question, index) => {
              const isCorrect = question.correct === true;

              return (
                <article
                  key={question.questionId}
                  className={`overflow-hidden rounded-xl bg-white shadow-sm ring-1 ${
                    isCorrect ? "ring-green-100" : "ring-red-100"
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Question {index + 1}
                      </p>

                      <h3 className="mt-2 text-base font-semibold leading-7 text-dark">
                        {question.questionText}
                      </h3>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>

                  {/* Answers */}
                  <div className="space-y-3 px-6 py-5">
                    <div
                      className={`rounded-lg border px-4 py-3 ${
                        isCorrect
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Your Answer
                      </p>

                      <p
                        className={`mt-1 font-medium ${
                          isCorrect ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {question.selectedOptionText || "Not answered"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Correct Answer
                      </p>

                      <p className="mt-1 font-medium text-green-700">
                        {question.correctOptionText || "Not available"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted">
                        Marks: {question.marks ?? 0}
                      </span>

                      <span
                        className={`text-sm font-semibold ${
                          isCorrect ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCorrect
                          ? `+${question.marks ?? 0} marks`
                          : "+0 marks"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ======================================================
            BOTTOM ACTION
            ====================================================== */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/my-learning"
            className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Back to My Learning
          </Link>
        </div>
      </div>
    </main>
  );
}

export default QuizResult;
