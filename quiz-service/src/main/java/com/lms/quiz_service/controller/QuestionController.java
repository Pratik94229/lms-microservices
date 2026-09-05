package com.lms.quiz_service.controller;

import com.lms.quiz_service.dto.InstructorQuestionResponse;
import com.lms.quiz_service.dto.QuestionCreateRequest;
import com.lms.quiz_service.dto.QuestionResponse;
import com.lms.quiz_service.dto.QuestionUpdateRequest;
import com.lms.quiz_service.model.Question;
import com.lms.quiz_service.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class QuestionController {

    private final QuestionService questionService;

    /*
     * ============================================================
     * CREATE QUESTION
     * ============================================================
     *
     * Instructor only.
     */
    @PostMapping("/quizzes/{quizId}/questions")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public Question createQuestion(
            @PathVariable String quizId,
            @Valid @RequestBody QuestionCreateRequest request
    ) {

        return questionService.createQuestion(
                quizId,
                request
        );
    }

    /*
     * ============================================================
     * GET QUESTIONS FOR QUIZ
     * ============================================================
     *
     * Used by students and instructors.
     *
     * IMPORTANT:
     * Correct answers are NOT returned.
     */
    @GetMapping("/quizzes/{quizId}/questions")
    public List<QuestionResponse> getQuestions(
            @PathVariable String quizId
    ) {

        return questionService.getQuestionsByQuizId(
                quizId
        );
    }

    /*
     * ============================================================
     * GET QUESTION DETAILS FOR INSTRUCTOR
     * ============================================================
     *
     * Instructor only.
     *
     * This endpoint returns the correct answer so that the
     * instructor edit form can pre-select the correct option.
     */
    @GetMapping("/questions/{questionId}/details")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public InstructorQuestionResponse getQuestionDetails(
            @PathVariable String questionId
    ) {

        return questionService.getQuestionDetails(
                questionId
        );
    }

    /*
     * ============================================================
     * UPDATE QUESTION
     * ============================================================
     *
     * Instructor only.
     */
    @PutMapping("/questions/{questionId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Question updateQuestion(
            @PathVariable String questionId,
            @Valid @RequestBody QuestionUpdateRequest request
    ) {

        return questionService.updateQuestion(
                questionId,
                request
        );
    }

    /*
     * ============================================================
     * DELETE QUESTION
     * ============================================================
     *
     * Instructor only.
     */
    @DeleteMapping("/questions/{questionId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuestion(
            @PathVariable String questionId
    ) {

        questionService.deleteQuestion(
                questionId
        );
    }
}