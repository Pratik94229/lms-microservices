package com.lms.quiz_service.service;

import com.lms.quiz_service.client.CourseServiceClient;
import com.lms.quiz_service.dto.QuizAnalyticsResponse;
import com.lms.quiz_service.dto.SectionResponse;
import com.lms.quiz_service.model.AttemptStatus;
import com.lms.quiz_service.model.Quiz;
import com.lms.quiz_service.model.QuizAttempt;
import com.lms.quiz_service.repository.QuizAttemptRepository;
import com.lms.quiz_service.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizAnalyticsService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final CourseServiceClient courseServiceClient;


    /*
     * =========================================================
     * GET QUIZ ANALYTICS FOR A COURSE
     * =========================================================
     *
     * Flow:
     *
     * Instructor
     *     ↓
     * Quiz Service
     *     ↓
     * Get course sections
     *     ↓
     * Find quizzes in each section
     *     ↓
     * Verify instructor ownership
     *     ↓
     * Find submitted attempts
     *     ↓
     * Calculate performance
     *     ↓
     * Return analytics
     */
    public List<QuizAnalyticsResponse> getCourseQuizAnalytics(
            String courseId
    ) {

        // ---------------------------------------------------------
        // 1. Get all sections belonging to the course.
        // ---------------------------------------------------------

        List<SectionResponse> sections =
                courseServiceClient.getSectionsByCourse(
                        courseId
                );

        List<QuizAnalyticsResponse> analytics =
                new ArrayList<>();


        // ---------------------------------------------------------
        // 2. Process every section.
        // ---------------------------------------------------------

        for (SectionResponse section : sections) {

            // -----------------------------------------------------
            // Verify that the authenticated instructor owns
            // the course containing this section.
            // -----------------------------------------------------

            courseServiceClient.verifySectionOwnership(
                    section.getId()
            );


            // -----------------------------------------------------
            // 3. Find quizzes belonging to this section.
            // -----------------------------------------------------

            List<Quiz> quizzes =
                    quizRepository.findBySectionId(
                            section.getId()
                    );


            // -----------------------------------------------------
            // 4. Process every quiz.
            // -----------------------------------------------------

            for (Quiz quiz : quizzes) {

                // -------------------------------------------------
                // Only submitted attempts count toward analytics.
                // -------------------------------------------------

                List<QuizAttempt> attempts =
                        quizAttemptRepository
                                .findByQuizIdAndStatus(
                                        quiz.getId(),
                                        AttemptStatus.SUBMITTED
                                );


                // -------------------------------------------------
                // Calculate total attempts.
                // -------------------------------------------------

                long totalAttempts =
                        attempts.size();


                // -------------------------------------------------
                // Calculate passed attempts.
                // -------------------------------------------------

                long passedAttempts =
                        attempts.stream()
                                .filter(attempt ->
                                        Boolean.TRUE.equals(
                                                attempt.getPassed()
                                        )
                                )
                                .count();


                // -------------------------------------------------
                // Calculate failed attempts.
                // -------------------------------------------------

                long failedAttempts =
                        attempts.stream()
                                .filter(attempt ->
                                        Boolean.FALSE.equals(
                                                attempt.getPassed()
                                        )
                                )
                                .count();


                // -------------------------------------------------
                // Calculate pass rate.
                //
                // Example:
                //
                // 8 passed / 10 attempts = 80%
                // -------------------------------------------------

                double passRate = 0.0;

                if (totalAttempts > 0) {

                    passRate =
                            (passedAttempts * 100.0)
                                    / totalAttempts;
                }


                // -------------------------------------------------
                // Calculate average percentage.
                // -------------------------------------------------

                double averagePercentage = 0.0;

                if (totalAttempts > 0) {

                    averagePercentage =
                            attempts.stream()
                                    .filter(attempt ->
                                            attempt.getPercentage()
                                                    != null
                                    )
                                    .mapToDouble(
                                            QuizAttempt::getPercentage
                                    )
                                    .average()
                                    .orElse(0.0);
                }


                // -------------------------------------------------
                // Build analytics response.
                // -------------------------------------------------

                QuizAnalyticsResponse response =
                        QuizAnalyticsResponse.builder()
                                .quizId(quiz.getId())
                                .quizTitle(quiz.getTitle())
                                .sectionId(quiz.getSectionId())
                                .totalAttempts(totalAttempts)
                                .passedAttempts(passedAttempts)
                                .failedAttempts(failedAttempts)
                                .passRate(passRate)
                                .averagePercentage(
                                        averagePercentage
                                )
                                .build();


                analytics.add(response);
            }
        }


        // ---------------------------------------------------------
        // 5. Return analytics for all quizzes in the course.
        // ---------------------------------------------------------

        return analytics;
    }
}