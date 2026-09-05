package com.lms.quiz_service.service;

import com.lms.quiz_service.client.CourseServiceClient;
import com.lms.quiz_service.dto.*;
import com.lms.quiz_service.exception.QuizNotFoundException;
import com.lms.quiz_service.model.Question;
import com.lms.quiz_service.model.QuestionOption;
import com.lms.quiz_service.model.Quiz;
import com.lms.quiz_service.repository.QuestionOptionRepository;
import com.lms.quiz_service.repository.QuestionRepository;
import com.lms.quiz_service.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;

    private final QuestionRepository questionRepository;

    private final QuestionOptionRepository questionOptionRepository;

    private final CourseServiceClient courseServiceClient;


    /*
     * ============================================================
     * CREATE QUIZ
     * ============================================================
     *
     * Create a new quiz inside a section.
     *
     * Before creating the quiz, we verify that the authenticated
     * instructor owns the section.
     *
     * Quiz Service
     *      ↓
     * Feign
     *      ↓
     * Course Service
     *      ↓
     * Section ownership check
     */
    public Quiz createQuiz(
            String sectionId,
            QuizCreateRequest request
    ) {

        // Verify that the authenticated instructor owns
        // the section.
        //
        // FeignClientConfig automatically forwards
        // the JWT to Course Service.
        courseServiceClient.verifySectionOwnership(
                sectionId
        );


        // Create Quiz entity.
        Quiz quiz = new Quiz();

        quiz.setSectionId(sectionId);
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setPassingScore(request.getPassingScore());
        quiz.setTimeLimit(request.getTimeLimit());


        // Save quiz.
        //
        // MongoDB compound index prevents duplicate quiz
        // titles inside the same section.
        return quizRepository.save(quiz);
    }


    /*
     * ============================================================
     * GET QUIZ BY ID
     * ============================================================
     *
     * Returns:
     *
     * Quiz
     *   ↓
     * Questions
     *   ↓
     * Options
     *
     * Correct answers are NOT exposed.
     */
    public QuizResponse getQuizById(
            String quizId
    ) {

        // Find quiz.
        Quiz quiz = quizRepository
                .findById(quizId)
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found"
                        )
                );


        // Find all questions belonging to this quiz.
        //
        // Questions are returned in order.
        List<Question> questions =
                questionRepository
                        .findByQuizIdOrderByOrderIndexAsc(
                                quizId
                        );


        // Convert Question entities into safe
        // QuestionResponse DTOs.
        List<QuestionResponse> questionResponses =
                questions.stream()
                        .map(this::toQuestionResponse)
                        .toList();


        // Build final QuizResponse.
        return QuizResponse.builder()
                .id(quiz.getId())
                .sectionId(quiz.getSectionId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .passingScore(quiz.getPassingScore())
                .timeLimit(quiz.getTimeLimit())
                .questions(questionResponses)
                .build();
    }


    /*
     * ============================================================
     * CONVERT QUESTION TO RESPONSE
     * ============================================================
     *
     * Converts Question entity into QuestionResponse.
     *
     * The correct answer is deliberately not included.
     */
    private QuestionResponse toQuestionResponse(
            Question question
    ) {

        // Find all options belonging to this question.
        List<QuestionOption> options =
                questionOptionRepository
                        .findByQuestionIdOrderByOrderIndexAsc(
                                question.getId()
                        );


        // Convert options into safe response DTOs.
        //
        // IMPORTANT:
        // We do NOT copy the "correct" field.
        List<QuestionOptionResponse> optionResponses =
                options.stream()
                        .map(option ->
                                QuestionOptionResponse.builder()
                                        .id(option.getId())
                                        .optionText(
                                                option.getOptionText()
                                        )
                                        .orderIndex(
                                                option.getOrderIndex()
                                        )
                                        .build()
                        )
                        .toList();


        return QuestionResponse.builder()
                .id(question.getId())
                .questionText(
                        question.getQuestionText()
                )
                .type(
                        question.getType()
                )
                .orderIndex(
                        question.getOrderIndex()
                )
                .marks(
                        question.getMarks()
                )
                .options(
                        optionResponses
                )
                .build();
    }


    /*
     * ============================================================
     * GET ALL QUIZZES BY SECTION
     * ============================================================
     *
     * Returns all quizzes belonging to a particular section.
     *
     * Example:
     *
     * GET /api/quizzes/sections/{sectionId}
     *
     * This is used by the Instructor Quiz Manager to display
     * all quizzes inside a section.
     */
    public List<Quiz> getQuizzesBySection(
            String sectionId
    ) {

        return quizRepository
                .findBySectionId(sectionId);
    }


    /*
     * ============================================================
     * UPDATE QUIZ
     * ============================================================
     *
     * Updates an existing quiz.
     *
     * Before updating, we verify that the authenticated
     * instructor owns the section containing this quiz.
     */
    public Quiz updateQuiz(
            String quizId,
            QuizUpdateRequest request
    ) {

        // Find the quiz.
        Quiz quiz = quizRepository
                .findById(quizId)
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found"
                        )
                );


        // Get the section containing this quiz.
        String sectionId = quiz.getSectionId();


        // Verify instructor ownership through Course Service.
        //
        // FeignClientConfig automatically forwards the JWT.
        courseServiceClient.verifySectionOwnership(
                sectionId
        );


        // Update quiz fields.
        quiz.setTitle(
                request.getTitle()
        );

        quiz.setDescription(
                request.getDescription()
        );

        quiz.setPassingScore(
                request.getPassingScore()
        );

        quiz.setTimeLimit(
                request.getTimeLimit()
        );


        // Save updated quiz.
        return quizRepository.save(quiz);
    }


    /*
     * ============================================================
     * DELETE QUIZ
     * ============================================================
     *
     * Deletes an existing quiz.
     *
     * Before deleting, we verify that the authenticated
     * instructor owns the section containing this quiz.
     */
    public void deleteQuiz(
            String quizId
    ) {

        // Find the quiz.
        Quiz quiz = quizRepository
                .findById(quizId)
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found"
                        )
                );


        // Get the section containing this quiz.
        String sectionId = quiz.getSectionId();


        // Verify instructor ownership through Course Service.
        courseServiceClient.verifySectionOwnership(
                sectionId
        );


        // Delete the quiz.
        quizRepository.delete(quiz);
    }
}