package com.lms.quiz_service.controller;

import com.lms.quiz_service.dto.AnswerSubmitRequest;
import com.lms.quiz_service.dto.AttemptAnswerResponse;
import com.lms.quiz_service.dto.AttemptResponse;
import com.lms.quiz_service.dto.AttemptResultQuestionResponse;
import com.lms.quiz_service.security.JwtPrincipal;
import com.lms.quiz_service.service.QuizAttemptAnswerService;
import com.lms.quiz_service.service.QuizAttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/attempts")
public class QuizAttemptAnswerController {

    private final QuizAttemptAnswerService quizAttemptAnswerService;
    private final QuizAttemptService quizAttemptService;


    /*
     * =========================================================
     * SUBMIT / UPDATE ANSWER
     * =========================================================
     *
     * Only students can submit answers.
     */
    @PostMapping("/{attemptId}/answers")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> submitAnswer(
            @PathVariable String attemptId,
            @Valid @RequestBody AnswerSubmitRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String studentId = principal.userId();

        quizAttemptAnswerService.submitAnswer(
                attemptId,
                studentId,
                request
        );

        return ResponseEntity.ok().build();
    }


    /*
     * =========================================================
     * GET SAVED ANSWERS
     * =========================================================
     *
     * Returns the answers selected by the logged-in student.
     *
     * IMPORTANT:
     * The response does NOT contain the correct answer.
     */
    @GetMapping("/{attemptId}/answers")
    @PreAuthorize("hasRole('STUDENT')")
    public List<AttemptAnswerResponse> getAttemptAnswers(
            @PathVariable String attemptId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String studentId = principal.userId();

        return quizAttemptAnswerService.getAttemptAnswers(
                attemptId,
                studentId
        );
    }


    /*
     * =========================================================
     * GET COMPLETED QUIZ RESULT
     * =========================================================
     *
     * Returns question-by-question result details.
     *
     * This endpoint can only be used after the attempt
     * has been submitted or automatically finalized.
     *
     * The service verifies that the attempt belongs to
     * the logged-in student.
     */
    @GetMapping("/{attemptId}/result")
    @PreAuthorize("hasRole('STUDENT')")
    public List<AttemptResultQuestionResponse> getAttemptResult(
            @PathVariable String attemptId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String studentId = principal.userId();

        return quizAttemptAnswerService.getAttemptResult(
                attemptId,
                studentId
        );
    }


    /*
     * =========================================================
     * SUBMIT COMPLETE ATTEMPT
     * =========================================================
     *
     * Only students can submit their own attempts.
     */
    @PostMapping("/{attemptId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public AttemptResponse submitAttempt(
            @PathVariable String attemptId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String studentId = principal.userId();

        return quizAttemptService.submitAttempt(
                attemptId,
                studentId
        );
    }
}