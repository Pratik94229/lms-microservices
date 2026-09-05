package com.lms.quiz_service.controller;

import com.lms.quiz_service.dto.QuizCreateRequest;
import com.lms.quiz_service.dto.QuizResponse;
import com.lms.quiz_service.dto.QuizUpdateRequest;
import com.lms.quiz_service.model.Quiz;
import com.lms.quiz_service.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    /*
     * Create a new quiz inside a section.
     *
     * Only instructors can create quizzes.
     */
    @PostMapping("/sections/{sectionId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public Quiz createQuiz(
            @PathVariable String sectionId,
            @Valid @RequestBody QuizCreateRequest request
    ) {

        return quizService.createQuiz(
                sectionId,
                request
        );
    }


    /*
     * Get a complete quiz.
     *
     * The response contains:
     *
     * Quiz
     *   ↓
     * Questions
     *   ↓
     * Options
     *
     * Correct answers are NOT exposed.
     */
    @GetMapping("/{quizId}")
    public QuizResponse getQuizById(
            @PathVariable String quizId
    ) {

        return quizService.getQuizById(
                quizId
        );
    }

    @PutMapping("/{quizId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Quiz updateQuiz(
            @PathVariable String quizId,
            @Valid @RequestBody QuizUpdateRequest request
    ) {

        return quizService.updateQuiz(
                quizId,
                request
        );
    }


    @DeleteMapping("/{quizId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuiz(
            @PathVariable String quizId
    ) {

        quizService.deleteQuiz(
                quizId
        );
    }
    
    @GetMapping("/sections/{sectionId}")
    public List<Quiz> getQuizzesBySection(
            @PathVariable String sectionId
    ) {
        return quizService.getQuizzesBySection(sectionId);
    }
}