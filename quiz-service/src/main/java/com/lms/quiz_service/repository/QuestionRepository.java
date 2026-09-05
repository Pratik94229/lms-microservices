package com.lms.quiz_service.repository;

import com.lms.quiz_service.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuestionRepository
        extends MongoRepository<Question, String> {

    /*
     * Check whether another question already uses
     * the same order index inside the quiz.
     */
    boolean existsByQuizIdAndOrderIndex(
            String quizId,
            Integer orderIndex
    );

    /*
     * Get all questions of a quiz in their
     * defined order.
     */
    List<Question> findByQuizIdOrderByOrderIndexAsc(
            String quizId
    );

    /*
     * Used later when deleting a quiz.
     */
    void deleteByQuizId(String quizId);
}