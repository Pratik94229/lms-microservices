package com.lms.quiz_service.repository;


import com.lms.quiz_service.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface QuizRepository extends MongoRepository<Quiz, String> {

    /*
     * Get all quizzes belonging to a section.
     *
     * We currently have only one quiz per section conceptually,
     * but keeping this as a List gives us flexibility if the
     * business requirement changes later.
     */
    List<Quiz> findBySectionId(String sectionId);

    /*
     * Find a specific quiz inside a specific section.
     *
     * This prevents accidentally treating a quiz from another
     * section as belonging to the requested section.
     */
    Optional<Quiz> findByIdAndSectionId(
            String quizId,
            String sectionId
    );

    /*
     * Check whether a quiz with the same title already
     * exists inside the section.
     */
    boolean existsBySectionIdAndTitle(
            String sectionId,
            String title
    );
}
