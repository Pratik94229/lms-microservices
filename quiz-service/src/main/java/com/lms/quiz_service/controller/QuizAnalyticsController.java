package com.lms.quiz_service.controller;

import com.lms.quiz_service.dto.QuizAnalyticsResponse;
import com.lms.quiz_service.service.QuizAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/quizzes")
public class QuizAnalyticsController {

    private final QuizAnalyticsService quizAnalyticsService;

    /*
     * =========================================================
     * COURSE QUIZ ANALYTICS
     * =========================================================
     *
     * Returns quiz performance analytics for all quizzes
     * belonging to the specified course.
     *
     * Only the instructor who owns the course should be able
     * to access this information.
     */
    @GetMapping("/courses/{courseId}/analytics")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public List<QuizAnalyticsResponse> getCourseQuizAnalytics(
            @PathVariable String courseId
    ) {

        return quizAnalyticsService.getCourseQuizAnalytics(
                courseId
        );
    }
}