package com.lms.quiz_service.controller;

import com.lms.quiz_service.dto.AttemptResponse;
import com.lms.quiz_service.exception.AttemptNotFoundException;
import com.lms.quiz_service.service.QuizAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/quizzes")
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;


    /*
     * =========================================================
     * START QUIZ ATTEMPT
     * =========================================================
     *
     * Only students can start a quiz.
     */
    @PostMapping("/{quizId}/attempts")
    @PreAuthorize("hasRole('STUDENT')")
    @ResponseStatus(HttpStatus.CREATED)
    public AttemptResponse startAttempt(
            @PathVariable String quizId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        String studentId = jwt.getSubject();

        return quizAttemptService.startAttempt(
                quizId,
                studentId
        );
    }


    /*
     * =========================================================
     * GET ACTIVE ATTEMPT
     * =========================================================
     *
     * Returns the student's current IN_PROGRESS attempt
     * for this quiz.
     */
    @GetMapping("/{quizId}/attempts/active")
    public ResponseEntity<AttemptResponse> getActiveAttempt(
            @PathVariable String quizId,
            Authentication authentication
    ) {

        String studentId = authentication.getName();

        try {
            AttemptResponse attempt =
                    quizAttemptService.getActiveAttempt(
                            quizId,
                            studentId
                    );

            return ResponseEntity.ok(attempt);

        } catch (AttemptNotFoundException e) {

            return ResponseEntity.noContent().build();
        }
    }


    /*
     * =========================================================
     * GET MY ATTEMPTS
     * =========================================================
     *
     * Returns all attempts belonging to the logged-in student.
     */
    @GetMapping("/attempts/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<AttemptResponse> getMyAttempts(
            @AuthenticationPrincipal Jwt jwt
    ) {

        String studentId = jwt.getSubject();

        return quizAttemptService.getMyAttempts(
                studentId
        );
    }


    /*
     * NOTE:
     *
     * The following endpoints are intentionally NOT here:
     *
     * POST /api/attempts/{attemptId}/submit
     * GET  /api/attempts/{attemptId}
     *
     * They belong to the /api/attempts controller structure.
     */
}