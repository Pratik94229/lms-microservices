package com.lms.quiz_service.service;

import com.lms.quiz_service.client.CourseServiceClient;
import com.lms.quiz_service.dto.InstructorQuestionOptionResponse;
import com.lms.quiz_service.dto.InstructorQuestionResponse;
import com.lms.quiz_service.dto.QuestionCreateRequest;
import com.lms.quiz_service.dto.QuestionOptionRequest;
import com.lms.quiz_service.dto.QuestionOptionResponse;
import com.lms.quiz_service.dto.QuestionResponse;
import com.lms.quiz_service.dto.QuestionUpdateRequest;
import com.lms.quiz_service.exception.QuestionAlreadyExistsException;
import com.lms.quiz_service.exception.QuizNotFoundException;
import com.lms.quiz_service.model.Question;
import com.lms.quiz_service.model.QuestionOption;
import com.lms.quiz_service.model.QuestionType;
import com.lms.quiz_service.model.Quiz;
import com.lms.quiz_service.repository.QuestionOptionRepository;
import com.lms.quiz_service.repository.QuestionRepository;
import com.lms.quiz_service.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final QuizRepository quizRepository;
    private final CourseServiceClient courseServiceClient;

    /*
     * ============================================================
     * CREATE QUESTION
     * ============================================================
     *
     * Creates a question inside a quiz.
     *
     * Flow:
     *
     * Instructor
     *     ↓
     * Quiz Service
     *     ↓
     * Verify Quiz
     *     ↓
     * Verify Instructor Ownership
     *     ↓
     * Validate Question
     *     ↓
     * Save Question
     *     ↓
     * Save Options
     */
    public Question createQuestion(
            String quizId,
            QuestionCreateRequest request
    ) {

        // ---------------------------------------------------------
        // 1. Verify that the quiz exists.
        // ---------------------------------------------------------

        Quiz quiz = quizRepository
                .findById(quizId)
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found"
                        )
                );

        // ---------------------------------------------------------
        // 2. Verify instructor ownership.
        // ---------------------------------------------------------

        courseServiceClient.verifySectionOwnership(
                quiz.getSectionId()
        );

        // ---------------------------------------------------------
        // 3. Prevent duplicate question order.
        // ---------------------------------------------------------

        if (questionRepository.existsByQuizIdAndOrderIndex(
                quiz.getId(),
                request.getOrderIndex()
        )) {

            throw new QuestionAlreadyExistsException(
                    "A question with this order index already exists in this quiz"
            );
        }

        // ---------------------------------------------------------
        // 4. Validate MCQ_SINGLE.
        //
        // Exactly one option must be correct.
        // ---------------------------------------------------------

        if (request.getType() == QuestionType.MCQ_SINGLE) {

            long correctOptionCount = request
                    .getOptions()
                    .stream()
                    .filter(QuestionOptionRequest::getCorrect)
                    .count();

            if (correctOptionCount != 1) {

                throw new IllegalArgumentException(
                        "MCQ_SINGLE must have exactly one correct option"
                );
            }
        }

        // ---------------------------------------------------------
        // 5. Validate option order indexes.
        // ---------------------------------------------------------

        long distinctOptionIndexes = request
                .getOptions()
                .stream()
                .map(QuestionOptionRequest::getOrderIndex)
                .distinct()
                .count();

        if (distinctOptionIndexes != request.getOptions().size()) {

            throw new IllegalArgumentException(
                    "Option order indexes must be unique"
            );
        }

        // ---------------------------------------------------------
        // 6. Create Question entity.
        // ---------------------------------------------------------

        Question question = Question.builder()
                .quizId(quiz.getId())
                .questionText(request.getQuestionText())
                .type(request.getType())
                .orderIndex(request.getOrderIndex())
                .marks(request.getMarks())
                .build();

        // ---------------------------------------------------------
        // 7. Save Question.
        // ---------------------------------------------------------

        Question savedQuestion = questionRepository.save(question);

        // ---------------------------------------------------------
        // 8. Create and save options.
        // ---------------------------------------------------------

        try {

            List<QuestionOption> options = request
                    .getOptions()
                    .stream()
                    .map(optionRequest ->
                            QuestionOption.builder()
                                    .questionId(
                                            savedQuestion.getId()
                                    )
                                    .optionText(
                                            optionRequest.getOptionText()
                                    )
                                    .orderIndex(
                                            optionRequest.getOrderIndex()
                                    )
                                    .correct(
                                            optionRequest.getCorrect()
                                    )
                                    .build()
                    )
                    .toList();

            questionOptionRepository.saveAll(options);

        } catch (RuntimeException ex) {

            // If options cannot be saved,
            // remove the question that was just created.

            questionRepository.deleteById(
                    savedQuestion.getId()
            );

            throw ex;
        }

        return savedQuestion;
    }

    /*
     * ============================================================
     * GET QUESTIONS BY QUIZ
     * ============================================================
     *
     * Returns all questions belonging to a quiz.
     *
     * Correct answers are deliberately NOT exposed.
     */
    public List<QuestionResponse> getQuestionsByQuizId(
            String quizId
    ) {

        // ---------------------------------------------------------
        // 1. Verify that the quiz exists.
        // ---------------------------------------------------------

        quizRepository
                .findById(quizId)
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found"
                        )
                );

        // ---------------------------------------------------------
        // 2. Find questions in order.
        // ---------------------------------------------------------

        List<Question> questions = questionRepository
                .findByQuizIdOrderByOrderIndexAsc(
                        quizId
                );

        // ---------------------------------------------------------
        // 3. Convert entities into safe DTOs.
        // ---------------------------------------------------------

        return questions.stream()
                .map(this::toQuestionResponse)
                .toList();
    }

    /*
     * ============================================================
     * GET QUESTION DETAILS FOR INSTRUCTOR
     * ============================================================
     *
     * Returns the question together with the correct answer.
     *
     * This endpoint is used by the instructor edit form.
     *
     * IMPORTANT:
     * The controller exposes this through an
     * INSTRUCTOR-only endpoint.
     */
    public InstructorQuestionResponse getQuestionDetails(
            String questionId
    ) {

        // ---------------------------------------------------------
        // 1. Find the question.
        // ---------------------------------------------------------

        Question question = questionRepository
                .findById(questionId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Question not found"
                        )
                );

        // ---------------------------------------------------------
        // 2. Find the quiz containing the question.
        // ---------------------------------------------------------

        Quiz quiz = quizRepository
                .findById(question.getQuizId())
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found"
                        )
                );

        // ---------------------------------------------------------
        // 3. Verify instructor ownership.
        //
        // Quiz → Section → Course → Instructor
        // ---------------------------------------------------------

        courseServiceClient.verifySectionOwnership(
                quiz.getSectionId()
        );

        // ---------------------------------------------------------
        // 4. Find all options.
        // ---------------------------------------------------------

        List<QuestionOption> options = questionOptionRepository
                .findByQuestionIdOrderByOrderIndexAsc(
                        questionId
                );

        // ---------------------------------------------------------
        // 5. Convert options.
        //
        // The instructor response includes the correct flag.
        // ---------------------------------------------------------

        List<InstructorQuestionOptionResponse> optionResponses =
                options.stream()
                        .map(option ->
                                InstructorQuestionOptionResponse
                                        .builder()
                                        .id(option.getId())
                                        .optionText(
                                                option.getOptionText()
                                        )
                                        .orderIndex(
                                                option.getOrderIndex()
                                        )
                                        .correct(
                                                option.getCorrect()
                                        )
                                        .build()
                        )
                        .toList();

        // ---------------------------------------------------------
        // 6. Build instructor response.
        // ---------------------------------------------------------

        return InstructorQuestionResponse
                .builder()
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
     * UPDATE QUESTION
     * ============================================================
     *
     * Updates:
     *
     * - Question text
     * - Question type
     * - Question order
     * - Marks
     * - Options
     * - Correct answer
     *
     * Existing options are completely replaced.
     */
    public Question updateQuestion(
            String questionId,
            QuestionUpdateRequest request
    ) {

        // ---------------------------------------------------------
        // 1. Find the question.
        // ---------------------------------------------------------

        Question question = questionRepository
                .findById(questionId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Question not found"
                        )
                );

        // ---------------------------------------------------------
        // 2. Find the quiz containing the question.
        // ---------------------------------------------------------

        Quiz quiz = quizRepository
                .findById(question.getQuizId())
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found"
                        )
                );

        // ---------------------------------------------------------
        // 3. Verify instructor ownership.
        // ---------------------------------------------------------

        courseServiceClient.verifySectionOwnership(
                quiz.getSectionId()
        );

        // ---------------------------------------------------------
        // 4. Check question order index.
        //
        // The current question can keep its existing order index.
        // ---------------------------------------------------------

        if (!question.getOrderIndex().equals(
                request.getOrderIndex()
        )) {

            if (questionRepository.existsByQuizIdAndOrderIndex(
                    question.getQuizId(),
                    request.getOrderIndex()
            )) {

                throw new QuestionAlreadyExistsException(
                        "A question with this order index already exists in this quiz"
                );
            }
        }

        // ---------------------------------------------------------
        // 5. Validate MCQ_SINGLE.
        // ---------------------------------------------------------

        if (request.getType() == QuestionType.MCQ_SINGLE) {

            long correctOptionCount = request
                    .getOptions()
                    .stream()
                    .filter(QuestionOptionRequest::getCorrect)
                    .count();

            if (correctOptionCount != 1) {

                throw new IllegalArgumentException(
                        "MCQ_SINGLE must have exactly one correct option"
                );
            }
        }

        // ---------------------------------------------------------
        // 6. Validate option order indexes.
        // ---------------------------------------------------------

        long distinctOptionIndexes = request
                .getOptions()
                .stream()
                .map(QuestionOptionRequest::getOrderIndex)
                .distinct()
                .count();

        if (distinctOptionIndexes != request.getOptions().size()) {

            throw new IllegalArgumentException(
                    "Option order indexes must be unique"
            );
        }

        // ---------------------------------------------------------
        // 7. Update question fields.
        // ---------------------------------------------------------

        question.setQuestionText(
                request.getQuestionText()
        );

        question.setType(
                request.getType()
        );

        question.setOrderIndex(
                request.getOrderIndex()
        );

        question.setMarks(
                request.getMarks()
        );

        // ---------------------------------------------------------
        // 8. Save updated question.
        // ---------------------------------------------------------

        Question savedQuestion =
                questionRepository.save(question);

        // ---------------------------------------------------------
        // 9. Remove existing options.
        //
        // We completely replace the option set.
        // ---------------------------------------------------------

        questionOptionRepository.deleteByQuestionId(
                questionId
        );

        // ---------------------------------------------------------
        // 10. Create replacement options.
        // ---------------------------------------------------------

        List<QuestionOption> options = request
                .getOptions()
                .stream()
                .map(optionRequest ->
                        QuestionOption.builder()
                                .questionId(
                                        savedQuestion.getId()
                                )
                                .optionText(
                                        optionRequest.getOptionText()
                                )
                                .orderIndex(
                                        optionRequest.getOrderIndex()
                                )
                                .correct(
                                        optionRequest.getCorrect()
                                )
                                .build()
                )
                .toList();

        // ---------------------------------------------------------
        // 11. Save replacement options.
        // ---------------------------------------------------------

        questionOptionRepository.saveAll(options);

        return savedQuestion;
    }

    /*
     * ============================================================
     * DELETE QUESTION
     * ============================================================
     *
     * Deletes:
     *
     * Question
     *     +
     * All associated options
     */
    public void deleteQuestion(
            String questionId
    ) {

        // ---------------------------------------------------------
        // 1. Find question.
        // ---------------------------------------------------------

        Question question = questionRepository
                .findById(questionId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Question not found"
                        )
                );

        // ---------------------------------------------------------
        // 2. Find quiz.
        // ---------------------------------------------------------

        Quiz quiz = quizRepository
                .findById(question.getQuizId())
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found"
                        )
                );

        // ---------------------------------------------------------
        // 3. Verify instructor ownership.
        // ---------------------------------------------------------

        courseServiceClient.verifySectionOwnership(
                quiz.getSectionId()
        );

        // ---------------------------------------------------------
        // 4. Delete options first.
        // ---------------------------------------------------------

        questionOptionRepository.deleteByQuestionId(
                questionId
        );

        // ---------------------------------------------------------
        // 5. Delete question.
        // ---------------------------------------------------------

        questionRepository.delete(question);
    }

    /*
     * ============================================================
     * CONVERT QUESTION TO SAFE RESPONSE
     * ============================================================
     *
     * The "correct" property is deliberately excluded.
     *
     * This prevents students from receiving the answer key.
     */
    private QuestionResponse toQuestionResponse(
            Question question
    ) {

        // ---------------------------------------------------------
        // Find options.
        // ---------------------------------------------------------

        List<QuestionOption> options =
                questionOptionRepository
                        .findByQuestionIdOrderByOrderIndexAsc(
                                question.getId()
                        );

        // ---------------------------------------------------------
        // Convert to safe option DTOs.
        // ---------------------------------------------------------

        List<QuestionOptionResponse> optionResponses =
                options.stream()
                        .map(option ->
                                QuestionOptionResponse
                                        .builder()
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

        // ---------------------------------------------------------
        // Build QuestionResponse.
        // ---------------------------------------------------------

        return QuestionResponse
                .builder()
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
}