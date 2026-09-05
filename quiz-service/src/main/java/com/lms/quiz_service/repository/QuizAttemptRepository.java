package com.lms.quiz_service.repository;

import com.lms.quiz_service.model.AttemptStatus;
import com.lms.quiz_service.model.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository
        extends MongoRepository<QuizAttempt, String> {

    List<QuizAttempt> findByStudentId(
            String studentId
    );

    List<QuizAttempt> findByQuizIdAndStudentId(
            String quizId,
            String studentId
    );

    Optional<QuizAttempt> findByQuizIdAndStudentIdAndStatus(
            String quizId,
            String studentId,
            AttemptStatus status
    );

    Optional<QuizAttempt> findByIdAndStudentId(
            String id,
            String studentId
    );


    /*
     * =========================================================
     * QUIZ ANALYTICS
     * =========================================================
     */

    long countByQuizIdAndStatus(
            String quizId,
            AttemptStatus status
    );

    long countByQuizIdAndStatusAndPassed(
            String quizId,
            AttemptStatus status,
            Boolean passed
    );

    List<QuizAttempt> findByQuizIdAndStatus(
            String quizId,
            AttemptStatus status
    );
}