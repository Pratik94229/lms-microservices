package com.lms.quiz_service.service;

import com.lms.quiz_service.dto.AnswerSubmitRequest;
import com.lms.quiz_service.dto.AttemptAnswerResponse;
import com.lms.quiz_service.dto.AttemptResultQuestionResponse;
import com.lms.quiz_service.exception.*;
import com.lms.quiz_service.model.*;
import com.lms.quiz_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizAttemptAnswerService {

    private final QuizAttemptRepository quizAttemptRepository;

    private final QuizAttemptAnswerRepository quizAttemptAnswerRepository;

    private final QuestionRepository questionRepository;

    private final QuestionOptionRepository questionOptionRepository;

    private final QuizRepository quizRepository;

    private final QuizAttemptService quizAttemptService;


    /*
     * =========================================================
     * SUBMIT / UPDATE ANSWER
     * =========================================================
     */
    public void submitAnswer(
            String attemptId,
            String studentId,
            AnswerSubmitRequest request
    ) {

        // ---------------------------------------------------------
        // 1. Find attempt.
        // ---------------------------------------------------------
        QuizAttempt attempt =
                quizAttemptRepository
                        .findById(attemptId)
                        .orElseThrow(() ->
                                new AttemptNotFoundException(
                                        "Quiz attempt not found"
                                )
                        );


        // ---------------------------------------------------------
        // 2. Verify ownership.
        // ---------------------------------------------------------
        if (!attempt.getStudentId().equals(studentId)) {

            throw new AttemptAccessDeniedException(
                    "You are not allowed to access this quiz attempt"
            );
        }


        // ---------------------------------------------------------
        // 3. Make sure attempt is still active.
        // ---------------------------------------------------------
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {

            throw new AttemptAlreadySubmittedException(
                    "This quiz attempt has already been submitted"
            );
        }


        // ---------------------------------------------------------
        // 4. Get quiz.
        // ---------------------------------------------------------
        Quiz quiz =
                quizRepository
                        .findById(attempt.getQuizId())
                        .orElseThrow(() ->
                                new QuizNotFoundException(
                                        "Quiz not found"
                                )
                        );


        // ---------------------------------------------------------
        // 5. Check time limit.
        // ---------------------------------------------------------
        if (quiz.getTimeLimit() != null) {

            LocalDateTime expiryTime =
                    attempt.getStartedAt()
                            .plusMinutes(
                                    quiz.getTimeLimit()
                            );


            if (LocalDateTime.now()
                    .isAfter(expiryTime)) {

                /*
                 * Time has expired.
                 *
                 * Automatically finalize the attempt using
                 * the answers already saved in the database.
                 */
                quizAttemptService.finalizeExpiredAttempt(
                        attempt,
                        quiz
                );


                /*
                 * Do not accept the new answer because the
                 * deadline has already passed.
                 */
                throw new QuizTimeExpiredException(
                        "The time limit for this quiz has expired. "
                                + "The attempt has been submitted automatically."
                );
            }
        }


        // ---------------------------------------------------------
        // 6. Find question.
        // ---------------------------------------------------------
        Question question =
                questionRepository
                        .findById(request.getQuestionId())
                        .orElseThrow(() ->
                                new InvalidAnswerException(
                                        "Question not found"
                                )
                        );


        // ---------------------------------------------------------
        // 7. Make sure question belongs to this quiz.
        // ---------------------------------------------------------
        if (!question.getQuizId().equals(
                attempt.getQuizId()
        )) {

            throw new InvalidAnswerException(
                    "Question does not belong to this quiz"
            );
        }


        // ---------------------------------------------------------
        // 8. Find selected option.
        // ---------------------------------------------------------
        QuestionOption option =
                questionOptionRepository
                        .findById(
                                request.getSelectedOptionId()
                        )
                        .orElseThrow(() ->
                                new InvalidAnswerException(
                                        "Selected option not found"
                                )
                        );


        // ---------------------------------------------------------
        // 9. Make sure option belongs to question.
        // ---------------------------------------------------------
        if (!option.getQuestionId().equals(
                question.getId()
        )) {

            throw new InvalidAnswerException(
                    "Selected option does not belong to this question"
            );
        }


        // ---------------------------------------------------------
        // 10. Find existing answer or create one.
        // ---------------------------------------------------------
        QuizAttemptAnswer answer =
                quizAttemptAnswerRepository
                        .findByAttemptIdAndQuestionId(
                                attemptId,
                                question.getId()
                        )
                        .orElse(
                                QuizAttemptAnswer.builder()
                                        .attemptId(attemptId)
                                        .questionId(question.getId())
                                        .build()
                        );


        // ---------------------------------------------------------
        // 11. Save selected option.
        // ---------------------------------------------------------
        answer.setSelectedOptionId(
                option.getId()
        );

        quizAttemptAnswerRepository.save(answer);
    }


    /*
     * =========================================================
     * GET SAVED ANSWERS
     * =========================================================
     */
    public List<AttemptAnswerResponse> getAttemptAnswers(
            String attemptId,
            String studentId
    ) {

        // ---------------------------------------------------------
        // 1. Find attempt.
        // ---------------------------------------------------------
        QuizAttempt attempt =
                quizAttemptRepository
                        .findById(attemptId)
                        .orElseThrow(() ->
                                new AttemptNotFoundException(
                                        "Quiz attempt not found"
                                )
                        );


        // ---------------------------------------------------------
        // 2. Verify ownership.
        // ---------------------------------------------------------
        if (!attempt.getStudentId().equals(studentId)) {

            throw new AttemptAccessDeniedException(
                    "You are not allowed to access this quiz attempt"
            );
        }


        // ---------------------------------------------------------
        // 3. Automatically finalize expired attempt.
        // ---------------------------------------------------------
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {

            Quiz quiz =
                    quizRepository
                            .findById(attempt.getQuizId())
                            .orElseThrow(() ->
                                    new QuizNotFoundException(
                                            "Quiz not found"
                                    )
                            );

            if (quizAttemptService.isAttemptExpired(
                    attempt,
                    quiz
            )) {

                quizAttemptService.finalizeExpiredAttempt(
                        attempt,
                        quiz
                );
            }
        }


        // ---------------------------------------------------------
        // 4. Get all saved answers.
        // ---------------------------------------------------------
        List<QuizAttemptAnswer> answers =
                quizAttemptAnswerRepository
                        .findByAttemptId(attemptId);


        // ---------------------------------------------------------
        // 5. Convert to safe response DTO.
        // ---------------------------------------------------------
        return answers.stream()
                .map(answer ->
                        AttemptAnswerResponse.builder()
                                .questionId(
                                        answer.getQuestionId()
                                )
                                .selectedOptionId(
                                        answer.getSelectedOptionId()
                                )
                                .build()
                )
                .toList();
    }


    /*
     * =========================================================
     * GET COMPLETED ATTEMPT RESULT DETAILS
     * =========================================================
     *
     * This endpoint is used after the quiz has been submitted.
     *
     * Unlike getAttemptAnswers(), this method is allowed to
     * expose the correct answer.
     */
    public List<AttemptResultQuestionResponse> getAttemptResult(
            String attemptId,
            String studentId
    ) {

        // ---------------------------------------------------------
        // 1. Find attempt.
        // ---------------------------------------------------------
        QuizAttempt attempt =
                quizAttemptRepository
                        .findById(attemptId)
                        .orElseThrow(() ->
                                new AttemptNotFoundException(
                                        "Quiz attempt not found"
                                )
                        );


        // ---------------------------------------------------------
        // 2. Verify ownership.
        // ---------------------------------------------------------
        if (!attempt.getStudentId().equals(studentId)) {

            throw new AttemptAccessDeniedException(
                    "You are not allowed to access this quiz attempt"
            );
        }


        // ---------------------------------------------------------
        // 3. Correct answers should only be exposed after
        //    the attempt has been submitted.
        // ---------------------------------------------------------
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {

            throw new InvalidAnswerException(
                    "Quiz result is available only after submission"
            );
        }


        // ---------------------------------------------------------
        // 4. Verify quiz exists.
        // ---------------------------------------------------------
        quizRepository
                .findById(attempt.getQuizId())
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found"
                        )
                );


        // ---------------------------------------------------------
        // 5. Get all questions for this quiz.
        // ---------------------------------------------------------
        List<Question> questions =
                questionRepository
                        .findByQuizIdOrderByOrderIndexAsc(
                                attempt.getQuizId()
                        );


        // ---------------------------------------------------------
        // 6. Get student's saved answers.
        // ---------------------------------------------------------
        List<QuizAttemptAnswer> answers =
                quizAttemptAnswerRepository
                        .findByAttemptId(attemptId);


        // ---------------------------------------------------------
        // 7. Convert answers into easy lookup structure.
        // ---------------------------------------------------------
        return questions.stream()
                .map(question -> {

                    QuizAttemptAnswer savedAnswer =
                            answers.stream()
                                    .filter(answer ->
                                            answer.getQuestionId()
                                                    .equals(
                                                            question.getId()
                                                    )
                                    )
                                    .findFirst()
                                    .orElse(null);


                    String selectedOptionId = null;
                    String selectedOptionText = null;

                    if (savedAnswer != null) {

                        selectedOptionId =
                                savedAnswer.getSelectedOptionId();

                        QuestionOption selectedOption =
                                questionOptionRepository
                                        .findById(
                                                selectedOptionId
                                        )
                                        .orElse(null);

                        if (selectedOption != null) {
                            selectedOptionText =
                                    selectedOption.getOptionText();
                        }
                    }


                    // -------------------------------------------------
                    // Find correct option.
                    // -------------------------------------------------
                    QuestionOption correctOption =
                            questionOptionRepository
                                    .findByQuestionIdAndCorrect(
                                            question.getId(),
                                            true
                                    )
                                    .orElse(null);


                    String correctOptionId = null;
                    String correctOptionText = null;

                    if (correctOption != null) {

                        correctOptionId =
                                correctOption.getId();

                        correctOptionText =
                                correctOption.getOptionText();
                    }


                    // -------------------------------------------------
                    // Determine whether student's answer is correct.
                    // -------------------------------------------------
                    Boolean correct = false;

                    if (selectedOptionId != null &&
                            correctOptionId != null) {

                        correct =
                                selectedOptionId.equals(
                                        correctOptionId
                                );
                    }


                    return AttemptResultQuestionResponse
                            .builder()
                            .questionId(
                                    question.getId()
                            )
                            .questionText(
                                    question.getQuestionText()
                            )
                            .marks(
                                    question.getMarks()
                            )
                            .selectedOptionId(
                                    selectedOptionId
                            )
                            .selectedOptionText(
                                    selectedOptionText
                            )
                            .correctOptionId(
                                    correctOptionId
                            )
                            .correctOptionText(
                                    correctOptionText
                            )
                            .correct(correct)
                            .build();

                })
                .toList();
    }
}