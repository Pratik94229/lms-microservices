package com.lms.quiz_service.repository;

import com.lms.quiz_service.model.QuizAttemptAnswer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptAnswerRepository
        extends MongoRepository<QuizAttemptAnswer, String> {

    Optional<QuizAttemptAnswer> findByAttemptIdAndQuestionId(
            String attemptId,
            String questionId
    );

    List<QuizAttemptAnswer> findByAttemptId(
            String attemptId
    );

    void deleteByAttemptId(
            String attemptId
    );
}