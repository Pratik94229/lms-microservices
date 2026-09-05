package com.lms.quiz_service.service;

import com.lms.quiz_service.client.CourseServiceClient;
import com.lms.quiz_service.dto.AttemptResponse;
import com.lms.quiz_service.dto.SectionResponse;
import com.lms.quiz_service.exception.*;
import com.lms.quiz_service.model.*;
import com.lms.quiz_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizAttemptService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptAnswerRepository quizAttemptAnswerRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final CourseServiceClient courseServiceClient;


    /*
     * =========================================================
     * START ATTEMPT
     * =========================================================
     */
    public AttemptResponse startAttempt(
            String quizId,
            String studentId
    ) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found"
                        )
                );

        /*
         * ---------------------------------------------------------
         * 1. Find the section containing this quiz.
         * ---------------------------------------------------------
         */
        SectionResponse section =
                courseServiceClient.getSectionById(
                        quiz.getSectionId()
                );

        /*
         * ---------------------------------------------------------
         * 2. Verify that the logged-in student is enrolled
         *    in the course containing this quiz.
         *
         *    Course Service receives the forwarded JWT and
         *    identifies the student from JWT subject.
         * ---------------------------------------------------------
         */
        courseServiceClient.verifyStudentEnrollment(
                section.getCourseId()
        );

        /*
         * ---------------------------------------------------------
         * 3. Check whether the student already has
         *    an active attempt.
         * ---------------------------------------------------------
         */
        quizAttemptRepository
                .findByQuizIdAndStudentIdAndStatus(
                        quizId,
                        studentId,
                        AttemptStatus.IN_PROGRESS
                )
                .ifPresent(existingAttempt -> {

                    throw new ActiveAttemptAlreadyExistsException(
                            "You already have an active attempt for this quiz"
                    );
                });

        /*
         * ---------------------------------------------------------
         * 4. Get quiz questions.
         * ---------------------------------------------------------
         */
        List<Question> questions =
                questionRepository
                        .findByQuizIdOrderByOrderIndexAsc(
                                quizId
                        );

        /*
         * ---------------------------------------------------------
         * 5. Calculate total marks.
         * ---------------------------------------------------------
         */
        int totalMarks =
                questions.stream()
                        .mapToInt(Question::getMarks)
                        .sum();

        /*
         * ---------------------------------------------------------
         * 6. Create attempt.
         * ---------------------------------------------------------
         */
        QuizAttempt attempt =
                QuizAttempt.builder()
                        .quizId(quizId)
                        .studentId(studentId)
                        .status(AttemptStatus.IN_PROGRESS)
                        .startedAt(LocalDateTime.now())
                        .score(null)
                        .totalMarks(totalMarks)
                        .percentage(null)
                        .passed(null)
                        .build();

        /*
         * ---------------------------------------------------------
         * 7. Save attempt.
         * ---------------------------------------------------------
         */
        QuizAttempt savedAttempt =
                quizAttemptRepository.save(attempt);

        return toResponse(savedAttempt);
    }


    /*
     * =========================================================
     * GET ACTIVE ATTEMPT
     * =========================================================
     */
    public AttemptResponse getActiveAttempt(
            String quizId,
            String studentId
    ) {

        Quiz quiz =
                quizRepository.findById(quizId)
                        .orElseThrow(() ->
                                new QuizNotFoundException(
                                        "Quiz not found"
                                )
                        );

        QuizAttempt attempt =
                quizAttemptRepository
                        .findByQuizIdAndStudentIdAndStatus(
                                quizId,
                                studentId,
                                AttemptStatus.IN_PROGRESS
                        )
                        .orElseThrow(() ->
                                new AttemptNotFoundException(
                                        "No active attempt found for this quiz"
                                )
                        );

        /*
         * If the time limit has expired,
         * automatically finalize the attempt.
         */
        if (isAttemptExpired(attempt, quiz)) {

            return finalizeAttempt(
                    attempt,
                    quiz
            );
        }

        return toResponse(attempt);
    }


    /*
     * =========================================================
     * SUBMIT ATTEMPT
     * =========================================================
     */
    public AttemptResponse submitAttempt(
            String attemptId,
            String studentId
    ) {

        QuizAttempt attempt =
                quizAttemptRepository
                        .findById(attemptId)
                        .orElseThrow(() ->
                                new AttemptNotFoundException(
                                        "Quiz attempt not found"
                                )
                        );

        if (!attempt.getStudentId().equals(studentId)) {

            throw new AttemptAccessDeniedException(
                    "You are not allowed to submit this quiz attempt"
            );
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {

            throw new AttemptAlreadySubmittedException(
                    "This quiz attempt has already been submitted"
            );
        }

        Quiz quiz =
                quizRepository.findById(attempt.getQuizId())
                        .orElseThrow(() ->
                                new QuizNotFoundException(
                                        "Quiz not found"
                                )
                        );

        return finalizeAttempt(
                attempt,
                quiz
        );
    }


    /*
     * =========================================================
     * FINALIZE EXPIRED ATTEMPT
     * =========================================================
     */
    public AttemptResponse finalizeExpiredAttempt(
            QuizAttempt attempt,
            Quiz quiz
    ) {

        return finalizeAttempt(
                attempt,
                quiz
        );
    }


    /*
     * =========================================================
     * FINALIZE ATTEMPT + CALCULATE SCORE
     * =========================================================
     */
    private AttemptResponse finalizeAttempt(
            QuizAttempt attempt,
            Quiz quiz
    ) {

        List<Question> questions =
                questionRepository
                        .findByQuizIdOrderByOrderIndexAsc(
                                attempt.getQuizId()
                        );

        List<QuizAttemptAnswer> answers =
                quizAttemptAnswerRepository
                        .findByAttemptId(
                                attempt.getId()
                        );

        int score =
                calculateScore(
                        questions,
                        answers
                );

        int totalMarks =
                attempt.getTotalMarks();

        double percentage = 0.0;

        if (totalMarks > 0) {

            percentage =
                    ((double) score / totalMarks) * 100.0;
        }

        boolean passed =
                percentage >= quiz.getPassingScore();

        attempt.setStatus(
                AttemptStatus.SUBMITTED
        );

        attempt.setSubmittedAt(
                LocalDateTime.now()
        );

        attempt.setScore(
                score
        );

        attempt.setPercentage(
                percentage
        );

        attempt.setPassed(
                passed
        );

        QuizAttempt savedAttempt =
                quizAttemptRepository.save(attempt);

        return toResponse(savedAttempt);
    }


    /*
     * =========================================================
     * CALCULATE SCORE
     * =========================================================
     */
    private int calculateScore(
            List<Question> questions,
            List<QuizAttemptAnswer> answers
    ) {

        int score = 0;

        for (QuizAttemptAnswer answer : answers) {

            Question question =
                    questions.stream()
                            .filter(q ->
                                    q.getId()
                                            .equals(
                                                    answer.getQuestionId()
                                            )
                            )
                            .findFirst()
                            .orElse(null);

            if (question == null) {
                continue;
            }

            QuestionOption selectedOption =
                    questionOptionRepository
                            .findById(
                                    answer.getSelectedOptionId()
                            )
                            .orElse(null);

            if (selectedOption == null) {
                continue;
            }

            if (Boolean.TRUE.equals(
                    selectedOption.getCorrect()
            )) {

                score += question.getMarks();
            }
        }

        return score;
    }


    /*
     * =========================================================
     * GET SINGLE ATTEMPT
     * =========================================================
     */
    public AttemptResponse getAttempt(
            String attemptId,
            String studentId
    ) {

        QuizAttempt attempt =
                quizAttemptRepository
                        .findByIdAndStudentId(
                                attemptId,
                                studentId
                        )
                        .orElseThrow(() ->
                                new AttemptNotFoundException(
                                        "Quiz attempt not found"
                                )
                        );

        if (attempt.getStatus() ==
                AttemptStatus.IN_PROGRESS) {

            Quiz quiz =
                    quizRepository
                            .findById(
                                    attempt.getQuizId()
                            )
                            .orElseThrow(() ->
                                    new QuizNotFoundException(
                                            "Quiz not found"
                                    )
                            );

            if (isAttemptExpired(
                    attempt,
                    quiz
            )) {

                return finalizeAttempt(
                        attempt,
                        quiz
                );
            }
        }

        return toResponse(attempt);
    }


    /*
     * =========================================================
     * GET MY ATTEMPTS
     * =========================================================
     */
    public List<AttemptResponse> getMyAttempts(
            String studentId
    ) {

        return quizAttemptRepository
                .findByStudentId(studentId)
                .stream()
                .map(attempt -> {

                    /*
                     * Only IN_PROGRESS attempts need
                     * an expiry check.
                     */
                    if (attempt.getStatus() ==
                            AttemptStatus.IN_PROGRESS) {

                        Quiz quiz =
                                quizRepository
                                        .findById(
                                                attempt.getQuizId()
                                        )
                                        .orElse(null);

                        /*
                         * If the quiz still exists and
                         * the attempt has expired,
                         * finalize it and return the
                         * updated response.
                         */
                        if (quiz != null &&
                                isAttemptExpired(
                                        attempt,
                                        quiz
                                )) {

                            return finalizeAttempt(
                                    attempt,
                                    quiz
                            );
                        }
                    }

                    return toResponse(attempt);
                })
                .toList();
    }


    /*
     * =========================================================
     * CHECK WHETHER ATTEMPT HAS EXPIRED
     * =========================================================
     */
    public boolean isAttemptExpired(
            QuizAttempt attempt,
            Quiz quiz
    ) {

        if (quiz.getTimeLimit() == null) {
            return false;
        }

        LocalDateTime expiryTime =
                attempt.getStartedAt()
                        .plusMinutes(
                                quiz.getTimeLimit()
                        );

        return !LocalDateTime.now()
                .isBefore(expiryTime);
    }


    /*
     * =========================================================
     * CONVERT ENTITY TO RESPONSE DTO
     * =========================================================
     */
    private AttemptResponse toResponse(
            QuizAttempt attempt
    ) {

        return AttemptResponse.builder()
                .id(attempt.getId())
                .quizId(attempt.getQuizId())
                .status(attempt.getStatus())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .score(attempt.getScore())
                .totalMarks(attempt.getTotalMarks())
                .percentage(attempt.getPercentage())
                .passed(attempt.getPassed())
                .build();
    }
}