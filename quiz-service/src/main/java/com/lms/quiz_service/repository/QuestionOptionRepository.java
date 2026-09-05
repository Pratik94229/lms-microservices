package com.lms.quiz_service.repository;

import com.lms.quiz_service.model.QuestionOption;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface QuestionOptionRepository
        extends MongoRepository<QuestionOption, String> {

    /*
     * Check whether another option already uses
     * the same order index inside the question.
     */
    boolean existsByQuestionIdAndOrderIndex(
            String questionId,
            Integer orderIndex
    );

    /*
     * Get all options belonging to a question
     * in their defined order.
     */
    List<QuestionOption> findByQuestionIdOrderByOrderIndexAsc(
            String questionId
    );

    /*
     * Find the correct option for a question.
     */
    Optional<QuestionOption> findByQuestionIdAndCorrect(
            String questionId,
            Boolean correct
    );

    /*
     * Used when deleting a question.
     */
    void deleteByQuestionId(String questionId);
}